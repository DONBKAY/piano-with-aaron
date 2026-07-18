const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const prisma = require("../config/db");

/**
 * Example certificate code:
 * PWA-2026-7F3A91BC
 */
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `PWA-${year}-${randomPart}`;
}

function getFrontendUrl() {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3000";

  return frontendUrl.replace(/\/$/, "");
}

function formatCertificateDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

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

const certificateSelect = {
  id: true,
  certificateCode: true,
  issuedAt: true,
  createdAt: true,
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
      category: true,
      subcategory: true,
    },
  },
};

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
        select: certificateSelect,
      });
    } catch (error) {
      if (error?.code !== "P2002") {
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
          select: certificateSelect,
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
        select: certificateSelect,
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
        select: certificateSelect,
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
 */
async function listMyCertificates(req, res) {
  try {
    const certificates =
      await prisma.certificate.findMany({
        where: {
          userId: req.user.id,
        },
        select: certificateSelect,
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
        valid: false,
        error: "Certificate code is required",
      });
    }

    const certificate =
      await prisma.certificate.findUnique({
        where: {
          certificateCode,
        },
        select: certificateSelect,
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
        category: certificate.course.category,
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

/**
 * GET /api/certificates/:certificateCode/download
 *
 * Generates and downloads a student's certificate as a PDF.
 */
async function downloadCertificate(req, res) {
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
        select: certificateSelect,
      });

    if (!certificate) {
      return res.status(404).json({
        error: "Certificate not found",
      });
    }

    if (certificate.user.id !== req.user.id) {
      return res.status(403).json({
        error: "You are not allowed to download this certificate",
      });
    }

    const verificationUrl =
      `${getFrontendUrl()}/certificates/verify/` +
      encodeURIComponent(certificate.certificateCode);

    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
    });

    const qrCodeBuffer = Buffer.from(
      qrDataUrl.split(",")[1],
      "base64"
    );

    const safeFilename = certificate.course.title
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename || "course"}-certificate.pdf"`
    );
    res.setHeader("Cache-Control", "private, no-store");

    const document = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
      info: {
        Title: `Certificate of Completion - ${certificate.course.title}`,
        Author: "Piano With Aaron",
        Subject: "Course Completion Certificate",
        Keywords:
          "Piano With Aaron, certificate, piano course, completion",
      },
    });

    document.on("error", (error) => {
      console.error("Certificate PDF stream error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          error: "Unable to generate certificate PDF",
        });
      } else {
        res.end();
      }
    });

    document.pipe(res);

    const pageWidth = document.page.width;
    const pageHeight = document.page.height;

    // Background
    document
      .rect(0, 0, pageWidth, pageHeight)
      .fill("#FFFDF7");

    // Outer border
    document
      .lineWidth(8)
      .strokeColor("#1E293B")
      .rect(22, 22, pageWidth - 44, pageHeight - 44)
      .stroke();

    // Gold inner border
    document
      .lineWidth(3)
      .strokeColor("#C59D35")
      .rect(35, 35, pageWidth - 70, pageHeight - 70)
      .stroke();

    // Decorative corner lines
    document
      .lineWidth(1)
      .strokeColor("#C59D35");

    document
      .moveTo(55, 70)
      .lineTo(180, 70)
      .stroke();

    document
      .moveTo(pageWidth - 180, 70)
      .lineTo(pageWidth - 55, 70)
      .stroke();

    document
      .moveTo(55, pageHeight - 70)
      .lineTo(180, pageHeight - 70)
      .stroke();

    document
      .moveTo(pageWidth - 180, pageHeight - 70)
      .lineTo(pageWidth - 55, pageHeight - 70)
      .stroke();

    // Brand
    document
      .fillColor("#C59D35")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("PIANO WITH AARON", 0, 65, {
        width: pageWidth,
        align: "center",
        characterSpacing: 2,
      });

    document
      .fillColor("#1E293B")
      .font("Helvetica-Bold")
      .fontSize(38)
      .text("CERTIFICATE", 0, 105, {
        width: pageWidth,
        align: "center",
        characterSpacing: 3,
      });

    document
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(17)
      .text("OF COURSE COMPLETION", 0, 153, {
        width: pageWidth,
        align: "center",
        characterSpacing: 2,
      });

    document
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(15)
      .text("This certificate is proudly presented to", 0, 203, {
        width: pageWidth,
        align: "center",
      });

    // Student name
    document
      .fillColor("#0F172A")
      .font("Helvetica-BoldOblique")
      .fontSize(34)
      .text(certificate.user.name, 100, 237, {
        width: pageWidth - 200,
        align: "center",
      });

    document
      .lineWidth(1)
      .strokeColor("#C59D35")
      .moveTo(190, 283)
      .lineTo(pageWidth - 190, 283)
      .stroke();

    document
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(15)
      .text(
        "for successfully completing the piano course",
        0,
        303,
        {
          width: pageWidth,
          align: "center",
        }
      );

    document
      .fillColor("#1E293B")
      .font("Helvetica-Bold")
      .fontSize(25)
      .text(certificate.course.title, 120, 336, {
        width: pageWidth - 240,
        align: "center",
      });

    document
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(12)
      .text(
        "Awarded in recognition of dedication, discipline, and successful completion of all course requirements.",
        145,
        379,
        {
          width: pageWidth - 290,
          align: "center",
          lineGap: 4,
        }
      );

    // Issue date
    document
      .fillColor("#1E293B")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        formatCertificateDate(certificate.issuedAt),
        95,
        463,
        {
          width: 200,
          align: "center",
        }
      );

    document
      .lineWidth(1)
      .strokeColor("#64748B")
      .moveTo(115, 482)
      .lineTo(275, 482)
      .stroke();

    document
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(10)
      .text("DATE OF ISSUE", 95, 490, {
        width: 200,
        align: "center",
      });

    // Instructor signature area
    document
      .fillColor("#1E293B")
      .font("Helvetica-BoldOblique")
      .fontSize(18)
      .text("Aaron", pageWidth - 315, 457, {
        width: 200,
        align: "center",
      });

    document
      .lineWidth(1)
      .strokeColor("#64748B")
      .moveTo(pageWidth - 295, 482)
      .lineTo(pageWidth - 135, 482)
      .stroke();

    document
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(10)
      .text("COURSE INSTRUCTOR", pageWidth - 315, 490, {
        width: 200,
        align: "center",
      });

    // QR code
    const qrSize = 74;
    const qrX = pageWidth / 2 - qrSize / 2;
    const qrY = 447;

    document.image(qrCodeBuffer, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });

    document
      .fillColor("#64748B")
      .font("Helvetica")
      .fontSize(7)
      .text("SCAN TO VERIFY", qrX - 8, qrY + qrSize + 3, {
        width: qrSize + 16,
        align: "center",
      });

    // Certificate code
    document
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(8)
      .text(
        `Certificate ID: ${certificate.certificateCode}`,
        0,
        pageHeight - 48,
        {
          width: pageWidth,
          align: "center",
        }
      );

    document.end();
  } catch (error) {
    console.error("Download certificate error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Unable to generate certificate PDF",
      });
    }

    return res.end();
  }
}

module.exports = {
  issueCertificate,
  getCourseCertificateStatus,
  listMyCertificates,
  verifyCertificate,
  downloadCertificate,
};
