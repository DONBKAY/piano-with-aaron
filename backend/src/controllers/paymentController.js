const crypto = require("crypto");
const prisma = require("../config/db");
const { initializeTransaction, verifyTransaction } = require("../services/paystackService");

// Paystack expects amounts in the smallest currency unit
function toSubunit(amount) {
  return Math.round(Number(amount) * 100);
}

function channelsForCurrency(currency) {
  return currency === "USD" ? ["card"] : ["mobile_money", "card"];
}

// Grants enrollment for a successful, verified payment. Safe to call multiple
// times for the same reference (from both the verify endpoint AND the
// webhook) — it will not create duplicate enrollments or double-process.
async function finalizeSuccessfulPayment(payment) {
  if (payment.status === "SUCCESS") return; // already processed

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", verifiedAt: new Date() },
    }),
    prisma.enrollment.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      update: {},
      create: { userId: payment.userId, courseId: payment.courseId },
    }),
  ]);
}

// POST /api/payments/initialize  (auth required)
// body: { courseId }
async function initializePayment(req, res) {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: "courseId is required" });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return res.status(404).json({ error: "Course not found" });
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId } },
  });
  if (existingEnrollment) {
    return res.status(409).json({ error: "You're already enrolled in this course" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const reference = `pwa_${crypto.randomBytes(10).toString("hex")}`;

  // Record the payment attempt before hitting Paystack so the webhook has
  // something to match against even if the browser never returns.
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
    const tx = await initializeTransaction({
      email: user.email,
      amount: toSubunit(course.price),
      currency: course.currency,
      reference,
      metadata: { userId: user.id, courseId: course.id, paymentId: payment.id },
      channels: channelsForCurrency(course.currency),
    });

    return res.json({ authorizationUrl: tx.authorization_url, reference });
  } catch (err) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    console.error("Paystack initialize failed:", err.response?.data || err.message);
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }
}

// GET /api/payments/verify/:reference  (auth required)
// Called by the frontend after Paystack redirects back, as a fast path —
// the webhook is the authoritative source of truth and will also fire.
async function verifyPayment(req, res) {
  const { reference } = req.params;

  const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
  if (!payment || payment.userId !== req.user.id) {
    return res.status(404).json({ error: "Payment not found" });
  }

  if (payment.status === "SUCCESS") {
    return res.json({ status: "SUCCESS" });
  }

  try {
    const tx = await verifyTransaction(reference);

    if (tx.status === "success") {
      await finalizeSuccessfulPayment(payment);
      return res.json({ status: "SUCCESS" });
    }

    if (tx.status === "failed" || tx.status === "abandoned") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return res.json({ status: "FAILED" });
    }

    return res.json({ status: "PENDING" });
  } catch (err) {
    console.error("Paystack verify failed:", err.response?.data || err.message);
    return res.status(502).json({ error: "Could not verify payment right now" });
  }
}

// POST /api/payments/webhook  (public, verified via Paystack signature)
// Mounted with express.raw() in server.js so req.body is a Buffer here.
async function handleWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body.toString());

  // Acknowledge immediately; Paystack retries on non-2xx or timeout
  res.sendStatus(200);

  if (event.event !== "charge.success") return;

  const reference = event.data?.reference;
  if (!reference) return;

  try {
    const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
    if (!payment) {
      console.warn(`Webhook received for unknown payment reference: ${reference}`);
      return;
    }
    await finalizeSuccessfulPayment(payment);
  } catch (err) {
    console.error("Webhook processing error:", err);
  }
}

module.exports = { initializePayment, verifyPayment, handleWebhook };
