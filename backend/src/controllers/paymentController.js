const crypto = require("crypto");
const prisma = require("../config/db");

const {
  initializeTransaction,
  verifyTransaction,
} = require("../services/paystackService");

const {
  sendMetaPurchaseEvent,
} = require("../services/metaConversionsService");

// Paystack expects amounts in the smallest currency unit.
function toSubunit(amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error("Invalid payment amount");
  }

  return Math.round(numericAmount * 100);
}

function channelsForCurrency(currency) {
  return String(currency).toUpperCase() === "USD"
    ? ["card"]
    : ["mobile_money", "card"];
}

function isLiveMode() {
  return process.env.PAYSTACK_SECRET_KEY?.startsWith(
    "sk_live_"
  );
}

function transactionMatchesPayment(
  transaction,
  payment
) {
  if (!transaction) {
    return false;
  }

  const expectedAmount = toSubunit(
    payment.amount
  );

  const expectedCurrency = String(
    payment.currency
  ).toUpperCase();

  const expectedDomain = isLiveMode()
    ? "live"
    : "test";

  return (
    transaction.status === "success" &&
    transaction.reference ===
      payment.paystackRef &&
    Number(transaction.amount) ===
      expectedAmount &&
    String(
      transaction.currency
    ).toUpperCase() === expectedCurrency &&
    transaction.domain === expectedDomain
  );
}

function getClientIp(req) {
  const forwardedFor =
    req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    undefined
  );
}

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim());

  const match = cookies.find((cookie) =>
    cookie.startsWith(`${cookieName}=`)
  );

  if (!match) {
    return undefined;
  }

  return decodeURIComponent(
    match.substring(cookieName.length + 1)
  );
}

async function getPaymentEventDetails(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: payment.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),

    prisma.course.findUnique({
      where: {
        id: payment.courseId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    }),
  ]);

  return {
    payment,
    user,
    course,
  };
}

// Marks the payment successful and grants course access.
// Safe to call repeatedly because enrollment uses upsert.
async function finalizeSuccessfulPayment(paymentId) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new Error(
        "Payment record not found"
      );
    }

    if (payment.status === "SUCCESS") {
      return {
        newlyFinalized: false,
        payment,
      };
    }

    const updatedPayment =
      await tx.payment.update({
        where: {
          id: payment.id,
        },

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

    return {
      newlyFinalized: true,
      payment: updatedPayment,
    };
  });
}

async function reportPurchaseToMeta({
  paymentId,
  req,
  transaction,
}) {
  try {
    const {
      payment,
      user,
      course,
    } = await getPaymentEventDetails(paymentId);

    await sendMetaPurchaseEvent({
      reference: payment.paystackRef,
      amount: Number(payment.amount),
      currency: payment.currency,
      user,
      course,

      clientIpAddress:
        transaction?.customer?.ip_address ||
        getClientIp(req),

      clientUserAgent:
        req?.headers?.["user-agent"],

      fbp: req ? getCookie(req, "_fbp") : undefined,
      fbc: req ? getCookie(req, "_fbc") : undefined,
    });
  } catch (error) {
    // Never reverse a successful payment because
    // an analytics request failed.
    console.error(
      "Meta CAPI Purchase failed:",
      error.metaResponse || error.message
    );
  }
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

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

    if (!course || !course.published) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId,
          },
        },
      });

    if (existingEnrollment) {
      return res.status(409).json({
        error:
          "You're already enrolled in this course",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const reference =
      `pwa_${crypto
        .randomBytes(16)
        .toString("hex")}`;

    const payment =
      await prisma.payment.create({
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
      const transaction =
        await initializeTransaction({
          email: user.email,
          amount: toSubunit(course.price),
          currency: course.currency,
          reference,

          metadata: {
            userId: user.id,
            courseId: course.id,
            paymentId: payment.id,
          },

          channels: channelsForCurrency(
            course.currency
          ),

          callback_url:
            process.env.PAYSTACK_CALLBACK_URL,
        });

      return res.status(200).json({
        authorizationUrl:
          transaction.authorization_url,

        accessCode:
          transaction.access_code,

        reference,
      });
    } catch (error) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",
        },
      });

      console.error(
        "Paystack initialization failed:",
        error.response?.data ||
          error.message
      );

      return res.status(502).json({
        error:
          "Could not start payment. Please try again.",
      });
    }
  } catch (error) {
    console.error(
      "Initialize payment error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to initialize payment",
    });
  }
}

// GET /api/payments/verify/:reference
async function verifyPayment(req, res) {
  try {
    const { reference } = req.params;

    const payment =
      await prisma.payment.findUnique({
        where: {
          paystackRef: reference,
        },
      });

    if (
      !payment ||
      payment.userId !== req.user.id
    ) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      const details =
        await getPaymentEventDetails(
          payment.id
        );

      return res.status(200).json({
        status: "SUCCESS",
        amountGhs:
          String(payment.currency).toUpperCase() ===
          "GHS"
            ? Number(payment.amount)
            : undefined,
        amount: Number(payment.amount),
        currency: payment.currency,
        courseId: payment.courseId,
        courseTitle:
          details.course?.title,
        courseSlug:
          details.course?.slug,
        reference:
          payment.paystackRef,
      });
    }

    const transaction =
      await verifyTransaction(reference);

    if (
      transactionMatchesPayment(
        transaction,
        payment
      )
    ) {
      const result =
        await finalizeSuccessfulPayment(
          payment.id
        );

      if (result.newlyFinalized) {
        await reportPurchaseToMeta({
          paymentId: payment.id,
          req,
          transaction,
        });
      }

      const details =
        await getPaymentEventDetails(
          payment.id
        );

      return res.status(200).json({
        status: "SUCCESS",
        amountGhs:
          String(payment.currency).toUpperCase() ===
          "GHS"
            ? Number(payment.amount)
            : undefined,
        amount: Number(payment.amount),
        currency: payment.currency,
        courseId: payment.courseId,
        courseTitle:
          details.course?.title,
        courseSlug:
          details.course?.slug,
        reference:
          payment.paystackRef,
      });
    }

    const finalFailureStatuses = [
      "failed",
      "abandoned",
      "reversed",
    ];

    if (
      finalFailureStatuses.includes(
        transaction?.status
      )
    ) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",
        },
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
      error.response?.data ||
        error.message
    );

    return res.status(502).json({
      error:
        "Could not verify payment right now",
    });
  }
}

// POST /api/payments/webhook
async function handleWebhook(req, res) {
  try {
    const signature =
      req.headers["x-paystack-signature"];

    if (
      !signature ||
      !Buffer.isBuffer(req.body)
    ) {
      return res.status(400).json({
        error:
          "Invalid webhook request",
      });
    }

    const expectedSignature = crypto
      .createHmac(
        "sha512",
        process.env.PAYSTACK_SECRET_KEY
      )
      .update(req.body)
      .digest("hex");

    const receivedBuffer = Buffer.from(
      signature,
      "hex"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "hex"
    );

    if (
      receivedBuffer.length !==
        expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    const event = JSON.parse(
      req.body.toString("utf8")
    );

    // Paystack expects an immediate response.
    res.sendStatus(200);

    if (
      event.event !== "charge.success"
    ) {
      return;
    }

    const reference =
      event.data?.reference;

    if (!reference) {
      return;
    }

    const payment =
      await prisma.payment.findUnique({
        where: {
          paystackRef: reference,
        },
      });

    if (!payment) {
      console.warn(
        `Webhook received for unknown payment reference: ${reference}`
      );

      return;
    }

    // Retrieve the transaction directly from
    // Paystack instead of trusting the payload alone.
    const transaction =
      await verifyTransaction(reference);

    if (
      !transactionMatchesPayment(
        transaction,
        payment
      )
    ) {
      console.error(
        "Webhook transaction verification mismatch",
        {
          reference,
          receivedAmount:
            transaction?.amount,
          expectedAmount:
            toSubunit(payment.amount),
          receivedCurrency:
            transaction?.currency,
          expectedCurrency:
            payment.currency,
          receivedDomain:
            transaction?.domain,
        }
      );

      return;
    }

    const result =
      await finalizeSuccessfulPayment(
        payment.id
      );

    if (result.newlyFinalized) {
      await reportPurchaseToMeta({
        paymentId: payment.id,
        req,
        transaction,
      });
    }
  } catch (error) {
    console.error(
      "Webhook processing error:",
      error.response?.data ||
        error.message
    );
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
};
