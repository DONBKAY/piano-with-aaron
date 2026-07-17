const prisma = require("../config/db");

const VALID_REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

function parseRating(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

function cleanComment(value) {
  return typeof value === "string" ? value.trim() : "";
}

// GET /api/reviews/public
// Public endpoint used by the homepage.
async function getPublicReviews(req, res) {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0 &&
      requestedLimit <= 20
        ? requestedLimit
        : 6;

    const reviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        course: {
          published: true,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get public reviews error:", error);

    return res.status(500).json({
      error: "Could not load reviews",
    });
  }
}

// GET /api/reviews/my
// Returns all reviews submitted by the logged-in student.
async function getMyReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get student reviews error:", error);

    return res.status(500).json({
      error: "Could not load your reviews",
    });
  }
}

// GET /api/reviews/course/:courseId/my
// Returns the logged-in student's review for one course.
async function getMyCourseReview(req, res) {
  try {
    const { courseId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      review,
    });
  } catch (error) {
    console.error("Get course review error:", error);

    return res.status(500).json({
      error: "Could not load your review",
    });
  }
}

// POST /api/reviews/course/:courseId
// Creates or updates the student's review.
async function submitReview(req, res) {
  try {
    const { courseId } = req.params;
    const rating = parseRating(req.body.rating);
    const comment = cleanComment(req.body.comment);

    if (!rating) {
      return res.status(400).json({
        error: "Rating must be a whole number between 1 and 5",
      });
    }

    if (!comment) {
      return res.status(400).json({
        error: "Please write a review comment",
      });
    }

    if (comment.length < 10) {
      return res.status(400).json({
        error: "Your review must contain at least 10 characters",
      });
    }

    if (comment.length > 1000) {
      return res.status(400).json({
        error: "Your review cannot exceed 1,000 characters",
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        published: true,
      },
    });

    if (!course || !course.published) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        error: "You must be enrolled in this course before reviewing it",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    const review = await prisma.review.upsert({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
      update: {
        rating,
        comment,
        status: "PENDING",
      },
      create: {
        userId: req.user.id,
        courseId,
        rating,
        comment,
        status: "PENDING",
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return res.status(existingReview ? 200 : 201).json({
      message: existingReview
        ? "Review updated and submitted for approval"
        : "Review submitted for approval",
      review,
    });
  } catch (error) {
    console.error("Submit review error:", error);

    return res.status(500).json({
      error: "Could not submit your review",
    });
  }
}

// DELETE /api/reviews/course/:courseId
// Lets a student delete their own review.
async function deleteMyReview(req, res) {
  try {
    const { courseId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    await prisma.review.delete({
      where: {
        id: review.id,
      },
    });

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete student review error:", error);

    return res.status(500).json({
      error: "Could not delete your review",
    });
  }
}

// GET /api/reviews/admin
// Admin can filter using ?status=PENDING, APPROVED or REJECTED.
async function getAdminReviews(req, res) {
  try {
    const requestedStatus = String(req.query.status || "")
      .trim()
      .toUpperCase();

    if (
      requestedStatus &&
      !VALID_REVIEW_STATUSES.includes(requestedStatus)
    ) {
      return res.status(400).json({
        error: "Invalid review status",
      });
    }

    const reviews = await prisma.review.findMany({
      where: requestedStatus
        ? {
            status: requestedStatus,
          }
        : undefined,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);

    return res.status(500).json({
      error: "Could not load reviews",
    });
  }
}

// PATCH /api/reviews/admin/:reviewId/status
// body: { status: "APPROVED" | "REJECTED" | "PENDING" }
async function updateReviewStatus(req, res) {
  try {
    const { reviewId } = req.params;
    const status = String(req.body.status || "")
      .trim()
      .toUpperCase();

    if (!VALID_REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Status must be PENDING, APPROVED or REJECTED",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Review status changed to ${status}`,
      review,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      error: "Could not update review status",
    });
  }
}

// DELETE /api/reviews/admin/:reviewId
async function deleteReviewAsAdmin(req, res) {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete review error:", error);

    return res.status(500).json({
      error: "Could not delete review",
    });
  }
}

module.exports = {
  getPublicReviews,
  getMyReviews,
  getMyCourseReview,
  submitReview,
  deleteMyReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReviewAsAdmin,
};
