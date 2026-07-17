const express = require("express");

const {
  getPublicReviews,
  getMyReviews,
  getMyCourseReview,
  submitReview,
  deleteMyReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReviewAsAdmin,
} = require("../controllers/reviewController");

const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Homepage testimonials
router.get("/public", getPublicReviews);

/*
|--------------------------------------------------------------------------
| Student Routes
|--------------------------------------------------------------------------
*/

// Get all my reviews
router.get(
  "/my",
  requireAuth,
  getMyReviews
);

// Get my review for a course
router.get(
  "/course/:courseId/my",
  requireAuth,
  getMyCourseReview
);

// Submit or update review
router.post(
  "/course/:courseId",
  requireAuth,
  submitReview
);

// Delete my review
router.delete(
  "/course/:courseId",
  requireAuth,
  deleteMyReview
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// View all reviews
router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  getAdminReviews
);

// Approve / Reject review
router.patch(
  "/admin/:reviewId/status",
  requireAuth,
  requireRole("ADMIN"),
  updateReviewStatus
);

// Delete review
router.delete(
  "/admin/:reviewId",
  requireAuth,
  requireRole("ADMIN"),
  deleteReviewAsAdmin
);

module.exports = router;
