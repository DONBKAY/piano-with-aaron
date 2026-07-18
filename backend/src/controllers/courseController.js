const prisma = require("../config/db");

/**
 * Calculates the average rating and approved review count.
 *
 * @param {Array<{ rating: number }>} reviews
 * @returns {{ averageRating: number, reviewCount: number }}
 */
function calculateReviewSummary(reviews = []) {
  const approvedReviews = Array.isArray(reviews) ? reviews : [];
  const reviewCount = approvedReviews.length;

  if (reviewCount === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const totalRating = approvedReviews.reduce(
    (total, review) => total + Number(review.rating || 0),
    0
  );

  return {
    averageRating: Number((totalRating / reviewCount).toFixed(1)),
    reviewCount,
  };
}

/**
 * Removes the internal reviews array and adds rating information.
 *
 * Used for course lists where full review comments are not needed.
 *
 * @param {object} course
 * @returns {object}
 */
function addReviewSummary(course) {
  const { reviews = [], ...courseWithoutReviews } = course;

  return {
    ...courseWithoutReviews,
    ...calculateReviewSummary(reviews),
  };
}

// GET /api/courses?category=&subcategory=&search=
async function listCourses(req, res) {
  try {
    const { category, subcategory, search } = req.query;

    const where = {
      published: true,

      ...(category && {
        category,
      }),

      ...(subcategory && {
        subcategory,
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const courses = await prisma.course.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        currency: true,
        category: true,
        subcategory: true,

        reviews: {
          where: {
            status: "APPROVED",
          },
          select: {
            rating: true,
          },
        },

        _count: {
          select: {
            sections: true,
            enrollments: true,
          },
        },
      },
    });

    const coursesWithRatings = courses.map(addReviewSummary);

    return res.status(200).json({
      courses: coursesWithRatings,
    });
  } catch (error) {
    console.error("List courses error:", error);

    return res.status(500).json({
      error: "Unable to load courses",
    });
  }
}

// GET /api/courses/categories
async function listCategories(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
      },

      select: {
        category: true,
        subcategory: true,
      },

      distinct: ["category", "subcategory"],
    });

    const grouped = {};

    for (const course of courses) {
      if (!course.category) {
        continue;
      }

      if (!grouped[course.category]) {
        grouped[course.category] = new Set();
      }

      if (course.subcategory) {
        grouped[course.category].add(course.subcategory);
      }
    }

    const result = Object.entries(grouped).map(
      ([category, subcategories]) => ({
        category,
        subcategories: [...subcategories],
      })
    );

    return res.status(200).json({
      categories: result,
    });
  } catch (error) {
    console.error("List categories error:", error);

    return res.status(500).json({
      error: "Unable to load course categories",
    });
  }
}

// GET /api/courses/:slug
async function getCourseBySlug(req, res) {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: {
        slug,
      },

      include: {
        reviews: {
          where: {
            status: "APPROVED",
          },

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,

            user: {
              select: {
                name: true,
              },
            },
          },
        },

        sections: {
          orderBy: {
            order: "asc",
          },

          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },

              select: {
                id: true,
                title: true,
                order: true,
                isPreview: true,
                durationSec: true,
                videoUrl: true,
                pdfUrl: true,
              },
            },
          },
        },
      },
    });

    if (!course || (!course.published && req.user?.role !== "ADMIN")) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    let isEnrolled = false;

    if (req.user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId: course.id,
          },
        },
      });

      isEnrolled =
        Boolean(enrollment) || req.user.role === "ADMIN";
    }

    const reviewSummary = calculateReviewSummary(course.reviews);

    const sanitized = {
      ...course,
      ...reviewSummary,

      sections: course.sections.map((section) => ({
        ...section,

        lessons: section.lessons.map((lesson) => {
          const canAccessLesson =
            lesson.isPreview || isEnrolled;

          return {
            ...lesson,

            videoUrl: canAccessLesson
              ? lesson.videoUrl
              : null,

            pdfUrl: canAccessLesson
              ? lesson.pdfUrl
              : null,

            locked: !canAccessLesson,
          };
        }),
      })),
    };

    return res.status(200).json({
      course: sanitized,
      isEnrolled,
    });
  } catch (error) {
    console.error("Get course by slug error:", error);

    return res.status(500).json({
      error: "Unable to load course",
    });
  }
}

// GET /api/courses/me/enrolled
async function listMyEnrolledCourses(req, res) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: req.user.id,
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            price: true,
            currency: true,
            category: true,
            subcategory: true,

            reviews: {
              where: {
                status: "APPROVED",
              },
              select: {
                rating: true,
              },
            },

            sections: {
              select: {
                lessons: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const completedLessons =
      await prisma.lessonProgress.findMany({
        where: {
          userId: req.user.id,
          completed: true,
        },

        select: {
          lessonId: true,
        },
      });

    const completedSet = new Set(
      completedLessons.map((lesson) => lesson.lessonId)
    );

    const courses = enrollments.map((enrollment) => {
      const lessonIds =
        enrollment.course.sections.flatMap((section) =>
          section.lessons.map((lesson) => lesson.id)
        );

      const totalLessons = lessonIds.length;

      const completed = lessonIds.filter((lessonId) =>
        completedSet.has(lessonId)
      ).length;

      const percent =
        totalLessons === 0
          ? 0
          : Math.round(
              (completed / totalLessons) * 100
            );

      const {
        sections,
        reviews,
        ...courseWithoutInternalData
      } = enrollment.course;

      return {
        ...courseWithoutInternalData,
        ...calculateReviewSummary(reviews),

        enrolledAt: enrollment.createdAt,

        progress: {
          completed,
          total: totalLessons,
          percent,
        },
      };
    });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("List enrolled courses error:", error);

    return res.status(500).json({
      error: "Unable to load enrolled courses",
    });
  }
}

module.exports = {
  listCourses,
  listCategories,
  getCourseBySlug,
  listMyEnrolledCourses,
};
