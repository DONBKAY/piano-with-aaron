require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const adminCourseRoutes = require("./routes/adminCourseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const { handleWebhook } = require("./controllers/paymentController");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));

// IMPORTANT: the Paystack webhook needs the raw request body to verify the
// HMAC signature, so it must be mounted BEFORE express.json() parses it.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminCourseRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/lessons", lessonRoutes);

// Central error handler (last middleware)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Piano with Aaron API running on http://localhost:${PORT}`);
});
