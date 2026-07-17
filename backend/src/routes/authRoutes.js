const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");

const {
  signup,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Limit brute-force attempts on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Too many attempts, please try again later.",
  },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected routes
router.get("/me", requireAuth, me);

router.put("/profile", requireAuth, updateProfile);

router.put(
  "/change-password",
  requireAuth,
  authLimiter,
  changePassword
);

module.exports = router;
