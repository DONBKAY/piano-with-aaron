const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

const adminOnly = [requireAuth, requireRole("ADMIN")];

/**
 * GET /api/admin/ping
 * Confirms that the logged-in user has ADMIN access.
 */
router.get("/ping", ...adminOnly, (req, res) => {
  res.json({
    message: `Welcome, admin ${req.user.email}`,
  });
});

/**
 * GET /api/admin/dashboard
 * Returns live statistics for the admin dashboard.
 */
router.get("/dashboard", ...adminOnly, async (req, res) => {
  try {
    const [
      students,
      courses,
      enrollments,
      successfulPayments,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),

      prisma.course.count(),

      prisma.enrollment.count(),

      prisma.payment.aggregate({
        where: {
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const revenue = Number(
      successfulPayments._sum.amount || 0
    );

    res.json({
      students,
      courses,
      enrollments,
      revenue,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Unable to load dashboard statistics",
    });
  }
});

/**
 * GET /api/admin/students
 * Returns all students with enrollment count and total spent.
 */
router.get("/students", ...adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,

        _count: {
          select: {
            enrollments: true,
          },
        },

        payments: {
          where: {
            status: "SUCCESS",
          },

          select: {
            amount: true,
          },
        },
      },
    });

    const students = users.map((user) => {
      const totalSpent = user.payments.reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
        enrollmentCount: user._count.enrollments,
        totalSpent: totalSpent.toFixed(2),
      };
    });

    res.json({
      students,
    });
  } catch (error) {
    console.error("Admin students error:", error);

    res.status(500).json({
      message: "Unable to load students",
    });
  }
});

/**
 * GET /api/admin/payments
 * Returns all payments with student and course details.
 */
router.get("/payments", ...adminOnly, async (req, res) => {
  try {
    const paymentRecords = await prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
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

    const payments = paymentRecords.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      status: payment.status,
      paystackRef: payment.paystackRef,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt,
      user: payment.user,
      course: payment.course,
    }));

    res.json({
      payments,
    });
  } catch (error) {
    console.error("Admin payments error:", error);

    res.status(500).json({
      message: "Unable to load payments",
    });
  }
});

/**
 * GET /api/admin/analytics
 * Returns revenue for the last six months and top courses.
 */
router.get("/analytics", ...adminOnly, async (req, res) => {
  try {
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    const [successfulPayments, courses] =
      await Promise.all([
        prisma.payment.findMany({
          where: {
            status: "SUCCESS",
            createdAt: {
              gte: startDate,
            },
          },

          select: {
            amount: true,
            createdAt: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        }),

        prisma.course.findMany({
          select: {
            id: true,
            title: true,

            _count: {
              select: {
                enrollments: true,
              },
            },
          },

          orderBy: {
            enrollments: {
              _count: "desc",
            },
          },

          take: 10,
        }),
      ]);

    const monthMap = new Map();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthMap.set(key, {
        month: label,
        revenue: 0,
      });
    }

    successfulPayments.forEach((payment) => {
      const paymentDate = new Date(payment.createdAt);

      const key = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;

      const monthEntry = monthMap.get(key);

      if (monthEntry) {
        monthEntry.revenue += Number(payment.amount);
      }
    });

    const revenueByMonth = Array.from(
      monthMap.values()
    ).map((item) => ({
      month: item.month,
      revenue: Number(item.revenue.toFixed(2)),
    }));

    const topCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      enrollments: course._count.enrollments,
    }));

    res.json({
      revenueByMonth,
      topCourses,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    res.status(500).json({
      message: "Unable to load analytics",
    });
  }
});

module.exports = router;
