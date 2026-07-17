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

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// Approved reviews displayed on the homepage
// GET /api/reviews/public
// GET /api/reviews/public?limit=6
router.get("/public", getPublicReviews);

/*
|--------------------------------------------------------------------------
| Student routes
|--------------------------------------------------------------------------
*/

// Get all reviews submitted by the logged-in student
// GET /api/reviews/my
router.get("/my", protect, getMyReviews);

// Get the logged-in student's review for one course
// GET /api/reviews/course/:courseId/my
router.get(
  "/course/:courseId/my",
  protect,
  getMyCourseReview
);

// Submit a new review or update an existing review
// POST /api/reviews/course/:courseId
router.post(
  "/course/:courseId",
  protect,
  submitReview
);

// Delete the logged-in student's review for a course
// DELETE /api/reviews/course/:courseId
router.delete(
  "/course/:courseId",
  protect,
  deleteMyReview
);

/*
|--------------------------------------------------------------------------
| Administrator routes
|--------------------------------------------------------------------------
*/

// Get all reviews or filter them by status
// GET /api/reviews/admin
// GET /api/reviews/admin?status=PENDING
router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminReviews
);

// Approve, reject, or return a review to pending
// PATCH /api/reviews/admin/:reviewId/status
router.patch(
  "/admin/:reviewId/status",
  protect,
  adminOnly,
  updateReviewStatus
);

// Permanently delete a review
// DELETE /api/reviews/admin/:reviewId
router.delete(
  "/admin/:reviewId",
  protect,
  adminOnly,
  deleteReviewAsAdmin
);

module.exports = router;
