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
const reviewRoutes = require("./routes/reviewRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const { handleWebhook } = require("./controllers/paymentController");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://piano-with-aaron.vercel.app",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without a browser origin,
      // including Postman and Railway health checks.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------------------------------------------
// Paystack Webhook
// MUST come before express.json()
// ------------------------------------------------------------
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ------------------------------------------------------------
// Home
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Piano With Aaron API",
    status: "running",
  });
});

// ------------------------------------------------------------
// Health Check
// ------------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Piano With Aaron API",
    allowedOrigins,
  });
});

// ------------------------------------------------------------
// API Routes
// ------------------------------------------------------------
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/admin", adminCourseRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/lessons", lessonRoutes);

// ------------------------------------------------------------
// Reviews
// ------------------------------------------------------------
app.use("/api/reviews", reviewRoutes);

// ------------------------------------------------------------
// Certificates
// ------------------------------------------------------------
app.use("/api/certificates", certificateRoutes);

// ------------------------------------------------------------
// 404 Handler
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// ------------------------------------------------------------
// Error Handler
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Piano With Aaron API running on port ${PORT}`);
  console.log("Allowed frontend origins:", allowedOrigins);
});
