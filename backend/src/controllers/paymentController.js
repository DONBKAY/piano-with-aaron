const crypto = require("crypto");
const prisma = require("../config/db");
const {
  initializeTransaction,
  verifyTransaction,
} = require("../services/paystackService");

// Paystack expects amounts in the smallest currency unit.
function toSubunit(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid payment amount");
  }

  return Math.round(numericAmount * 100);
}

function channelsForCurrency(currency) {
  return currency === "USD"
    ? ["card"]
    : ["mobile_money", "card"];
}

function isLiveMode() {
  return process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_");
}

function transactionMatchesPayment(transaction, payment) {
  if (!transaction) return false;

  const expectedAmount = toSubunit(payment.amount);
  const expectedCurrency = String(payment.currency).toUpperCase();
  const expectedDomain = isLiveMode() ? "live" : "test";

  return (
    transaction.status === "success" &&
    transaction.reference === payment.paystackRef &&
    Number(transaction.amount) === expectedAmount &&
    String(transaction.currency).toUpperCase() === expectedCurrency &&
    transaction.domain === expectedDomain
  );
}

// Marks the payment successful and grants course access.
// Safe to call repeatedly because the enrollment uses upsert.
async function finalizeSuccessfulPayment(paymentId) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    if (payment.status === "SUCCESS") {
      return;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        verifiedAt: new Date(),
      },
    });

    await tx.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      },
      update: {},
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
      },
    });
  });
}

// POST /api/payments/initialize
async function initializePayment(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        error: "courseId is required",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.published) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        error: "You're already enrolled in this course",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const reference = `pwa_${crypto.randomBytes(16).toString("hex")}`;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: course.price,
        currency: course.currency,
        paystackRef: reference,
        status: "PENDING",
      },
    });

    try {
      const transaction = await initializeTransaction({
        email: user.email,
        amount: toSubunit(course.price),
        currency: course.currency,
        reference,
        metadata: {
          userId: user.id,
          courseId: course.id,
          paymentId: payment.id,
        },
        channels: channelsForCurrency(course.currency),
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
      });

      return res.status(200).json({
        authorizationUrl: transaction.authorization_url,
        accessCode: transaction.access_code,
        reference,
      });
    } catch (error) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      console.error(
        "Paystack initialization failed:",
        error.response?.data || error.message
      );

      return res.status(502).json({
        error: "Could not start payment. Please try again.",
      });
    }
  } catch (error) {
    console.error("Initialize payment error:", error);

    return res.status(500).json({
      error: "Unable to initialize payment",
    });
  }
}

// GET /api/payments/verify/:reference
async function verifyPayment(req, res) {
  try {
    const { reference } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference },
    });

    if (!payment || payment.userId !== req.user.id) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        status: "SUCCESS",
      });
    }

    const transaction = await verifyTransaction(reference);

    if (transactionMatchesPayment(transaction, payment)) {
      await finalizeSuccessfulPayment(payment.id);

      return res.status(200).json({
        status: "SUCCESS",
      });
    }

    const finalFailureStatuses = [
      "failed",
      "abandoned",
      "reversed",
    ];

    if (finalFailureStatuses.includes(transaction?.status)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return res.status(200).json({
        status: "FAILED",
      });
    }

    return res.status(200).json({
      status: "PENDING",
    });
  } catch (error) {
    console.error(
      "Paystack verification failed:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      error: "Could not verify payment right now",
    });
  }
}

// POST /api/payments/webhook
async function handleWebhook(req, res) {
  try {
    const signature = req.headers["x-paystack-signature"];

    if (!signature || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        error: "Invalid webhook request",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    const receivedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    // Paystack expects an immediate 200 response.
    res.sendStatus(200);

    if (event.event !== "charge.success") {
      return;
    }

    const reference = event.data?.reference;

    if (!reference) {
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference },
    });

    if (!payment) {
      console.warn(
        `Webhook received for unknown payment reference: ${reference}`
      );
      return;
    }

    // Do not trust the webhook payload alone.
    // Retrieve the transaction directly from Paystack.
    const transaction = await verifyTransaction(reference);

    if (!transactionMatchesPayment(transaction, payment)) {
      console.error("Webhook transaction verification mismatch", {
        reference,
        receivedAmount: transaction?.amount,
        expectedAmount: toSubunit(payment.amount),
        receivedCurrency: transaction?.currency,
        expectedCurrency: payment.currency,
        receivedDomain: transaction?.domain,
      });

      return;
    }

    await finalizeSuccessfulPayment(payment.id);
  } catch (error) {
    console.error(
      "Webhook processing error:",
      error.response?.data || error.message
    );
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
};
