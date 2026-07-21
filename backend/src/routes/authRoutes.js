const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const {
  signup,
  createAdmin,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// General protection against repeated authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts, please try again later.",
  },
});

// Stronger protection for administrator account creation
const createAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many administrator creation attempts. Please try again later.",
  },
});

// Public authentication routes
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected student/user routes
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);

// Admin-only route
router.post(
  "/admins",
  requireAuth,
  requireAdmin,
  createAdminLimiter,
  createAdmin
);

module.exports = router;
