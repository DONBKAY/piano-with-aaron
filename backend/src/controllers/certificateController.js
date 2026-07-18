const crypto = require("crypto");
const prisma = require("../config/db");

/**
 * Creates a unique, readable certificate code.
 *
 * Example:
 * PWA-2026-7F3A91BC
 */
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `PWA-${year}-${randomPart}`;
}

/**
 * Calculates the student's completion progress for a course.
 */
async function calculateCourseProgress(userId, courseId) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
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
  });

  if (!course || !course.published) {
    return {
      course: null,
      totalLessons: 0,
      completedLessons: 0,
      percent: 0,
    };
  }

  const lessonIds = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => lesson.id)
  );

  const totalLessons = lessonIds.length;

  if (totalLessons === 0) {
    return {
      course,
      totalLessons: 0,
      completedLessons: 0,
      percent: 0,
    };
  }

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: {
        in: lessonIds,
      },
      completed: true,
    },
  });

  const percent = Math.round(
    (completedLessons / totalLessons) * 100
  );

  return {
    course,
    totalLessons,
    completedLessons,
    percent,
  };
}

/**
 * Creates a certificate using a unique code.
 */
async function createCertificateWithUniqueCode(userId, courseId) {
  const maximumAttempts = 5;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const certificateCode = generateCertificateCode();

    try {
      return await prisma.certificate.create({
        data: {
          certificateCode,
          userId,
          courseId,
        },
        select: {
          id: true,
          certificateCode: true,
          issuedAt: true,
          createdAt: true,
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
              thumbnailUrl: true,
            },
          },
        },
      });
    } catch (error) {
      const isUniqueConstraintError =
        error?.code === "P2002";

      if (!isUniqueConstraintError) {
        throw error;
      }

      const existingCertificate =
        await prisma.certificate.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          select: {
            id: true,
            certificateCode: true,
            issuedAt: true,
            createdAt: true,
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
                thumbnailUrl: true,
              },
            },
          },
        });

      if (existingCertificate) {
        return existingCertificate;
      }
    }
  }

  throw new Error("Unable to generate a unique certificate code");
}

/**
 * POST /api/certificates/course/:courseId/issue
 *
 * Issues a certificate after confirming:
 * - the student is enrolled;
 * - the course contains lessons;
 * - every lesson has been completed.
 */
async function issueCertificate(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existingCertificate =
      await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: {
          id: true,
          certificateCode: true,
          issuedAt: true,
          createdAt: true,
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
              thumbnailUrl: true,
            },
          },
        },
      });

    if (existingCertificate) {
      return res.status(200).json({
        message: "Certificate already issued",
        certificate: existingCertificate,
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        error:
          "You must be enrolled in this course before receiving a certificate",
      });
    }

    const progress = await calculateCourseProgress(
      userId,
      courseId
    );

    if (!progress.course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    if (progress.totalLessons === 0) {
      return res.status(400).json({
        error:
          "This course does not contain any lessons and cannot issue a certificate yet",
      });
    }

    if (progress.completedLessons < progress.totalLessons) {
      return res.status(400).json({
        error:
          "Complete every lesson before requesting your certificate",
        progress: {
          completed: progress.completedLessons,
          total: progress.totalLessons,
          percent: progress.percent,
        },
      });
    }

    const certificate =
      await createCertificateWithUniqueCode(
        userId,
        courseId
      );

    return res.status(201).json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    console.error("Issue certificate error:", error);

    return res.status(500).json({
      error: "Unable to issue certificate",
    });
  }
}

/**
 * GET /api/certificates/course/:courseId/status
 *
 * Returns the student's certificate status and progress
 * for a particular course.
 */
async function getCourseCertificateStatus(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        error: "You are not enrolled in this course",
      });
    }

    const certificate =
      await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: {
          id: true,
          certificateCode: true,
          issuedAt: true,
          createdAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

    const progress = await calculateCourseProgress(
      userId,
      courseId
    );

    if (!progress.course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const eligible =
      progress.totalLessons > 0 &&
      progress.completedLessons === progress.totalLessons;

    return res.status(200).json({
      eligible,
      certificateIssued: Boolean(certificate),
      certificate,
      progress: {
        completed: progress.completedLessons,
        total: progress.totalLessons,
        percent: progress.percent,
      },
    });
  } catch (error) {
    console.error(
      "Get course certificate status error:",
      error
    );

    return res.status(500).json({
      error: "Unable to load certificate status",
    });
  }
}

/**
 * GET /api/certificates/my
 *
 * Returns all certificates belonging to the logged-in student.
 */
async function listMyCertificates(req, res) {
  try {
    const certificates =
      await prisma.certificate.findMany({
        where: {
          userId: req.user.id,
        },
        select: {
          id: true,
          certificateCode: true,
          issuedAt: true,
          createdAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
              category: true,
              subcategory: true,
            },
          },
        },
        orderBy: {
          issuedAt: "desc",
        },
      });

    return res.status(200).json({
      certificates,
    });
  } catch (error) {
    console.error("List certificates error:", error);

    return res.status(500).json({
      error: "Unable to load your certificates",
    });
  }
}

/**
 * GET /api/certificates/verify/:certificateCode
 *
 * Public endpoint for certificate verification.
 */
async function verifyCertificate(req, res) {
  try {
    const certificateCode = String(
      req.params.certificateCode || ""
    )
      .trim()
      .toUpperCase();

    if (!certificateCode) {
      return res.status(400).json({
        error: "Certificate code is required",
      });
    }

    const certificate =
      await prisma.certificate.findUnique({
        where: {
          certificateCode,
        },
        select: {
          id: true,
          certificateCode: true,
          issuedAt: true,
          user: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        error: "Certificate not found",
      });
    }

    return res.status(200).json({
      valid: true,
      certificate: {
        certificateCode: certificate.certificateCode,
        studentName: certificate.user.name,
        courseTitle: certificate.course.title,
        courseSlug: certificate.course.slug,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);

    return res.status(500).json({
      valid: false,
      error: "Unable to verify certificate",
    });
  }
}

module.exports = {
  issueCertificate,
  getCourseCertificateStatus,
  listMyCertificates,
  verifyCertificate,
};
