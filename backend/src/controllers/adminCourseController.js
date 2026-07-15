const prisma = require("../config/db");
const { slugify } = require("../utils/slugify");

const VALID_CATEGORIES = {
  "Beginners Corner": ["Piano Basics", "Reading Music 101"],
  "Intermediate Pathway": ["Chord Inversions", "Scales & Arpeggios"],
  "Advanced Techniques": ["Jazz Improvisation", "Advanced Rhythms"],
  "Learning Songs": ["Pop Hits", "Classical Pieces"],
};

function validateCategory(category, subcategory) {
  if (!VALID_CATEGORIES[category]) {
    return `Unknown category "${category}"`;
  }
  if (!VALID_CATEGORIES[category].includes(subcategory)) {
    return `"${subcategory}" is not a valid subcategory of "${category}"`;
  }
  return null;
}

async function listAllCourses(req, res) {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sections: true, enrollments: true } } },
  });
  return res.json({ courses });
}

async function getCourseById(req, res) {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) return res.status(404).json({ error: "Course not found" });
  return res.json({ course });
}

async function createCourse(req, res) {
  const { title, description, thumbnailUrl, price, currency, category, subcategory, published } =
    req.body;

  if (!title || !description || price === undefined || !category || !subcategory) {
    return res.status(400).json({
      error: "title, description, price, category, and subcategory are required",
    });
  }

  const categoryError = validateCategory(category, subcategory);
  if (categoryError) return res.status(400).json({ error: categoryError });

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      thumbnailUrl,
      price,
      currency: currency || "GHS",
      category,
      subcategory,
      published: Boolean(published),
    },
  });

  return res.status(201).json({ course });
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, thumbnailUrl, price, currency, category, subcategory, published } =
    req.body;

  if (category && subcategory) {
    const categoryError = validateCategory(category, subcategory);
    if (categoryError) return res.status(400).json({ error: categoryError });
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(price !== undefined && { price }),
      ...(currency !== undefined && { currency }),
      ...(category !== undefined && { category }),
      ...(subcategory !== undefined && { subcategory }),
      ...(published !== undefined && { published: Boolean(published) }),
    },
  });

  return res.json({ course });
}

async function deleteCourse(req, res) {
  const { id } = req.params;
  await prisma.course.delete({ where: { id } });
  return res.status(204).send();
}

async function createSection(req, res) {
  const { courseId } = req.params;
  const { title, order } = req.body;

  if (!title) return res.status(400).json({ error: "title is required" });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const section = await prisma.section.create({
    data: { courseId, title, order: order ?? 0 },
  });

  return res.status(201).json({ section });
}

async function updateSection(req, res) {
  const { sectionId } = req.params;
  const { title, order } = req.body;

  const section = await prisma.section.update({
    where: { id: sectionId },
    data: {
      ...(title !== undefined && { title }),
      ...(order !== undefined && { order }),
    },
  });

  return res.json({ section });
}

async function deleteSection(req, res) {
  const { sectionId } = req.params;
  await prisma.section.delete({ where: { id: sectionId } });
  return res.status(204).send();
}

async function createLesson(req, res) {
  const { sectionId } = req.params;
  const { title, videoUrl, pdfUrl, order, isPreview, durationSec } = req.body;

  if (!title || !videoUrl) {
    return res.status(400).json({ error: "title and videoUrl are required" });
  }

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) return res.status(404).json({ error: "Section not found" });

  const lesson = await prisma.lesson.create({
    data: {
      sectionId,
      title,
      videoUrl,
      pdfUrl,
      order: order ?? 0,
      isPreview: Boolean(isPreview),
      durationSec,
    },
  });

  return res.status(201).json({ lesson });
}

async function updateLesson(req, res) {
  const { lessonId } = req.params;
  const { title, videoUrl, pdfUrl, order, isPreview, durationSec } = req.body;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(pdfUrl !== undefined && { pdfUrl }),
      ...(order !== undefined && { order }),
      ...(isPreview !== undefined && { isPreview: Boolean(isPreview) }),
      ...(durationSec !== undefined && { durationSec }),
    },
  });

  return res.json({ lesson });
}

async function deleteLesson(req, res) {
  const { lessonId } = req.params;
  await prisma.lesson.delete({ where: { id: lessonId } });
  return res.status(204).send();
}

async function listCourseEnrollments(req, res) {
  const { courseId } = req.params;

  const totalLessons = await prisma.lesson.count({
    where: { section: { courseId } },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const withProgress = await Promise.all(
    enrollments.map(async (e) => {
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId: e.userId,
          completed: true,
          lesson: { section: { courseId } },
        },
      });
      const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
      return {
        id: e.id,
        user: e.user,
        enrolledAt: e.createdAt,
        completedLessons: completedCount,
        totalLessons,
        completionPercent: percent,
      };
    })
  );

  const averageCompletion = withProgress.length
    ? Math.round(
        withProgress.reduce((sum, e) => sum + e.completionPercent, 0) / withProgress.length
      )
    : 0;

  return res.json({
    enrollments: withProgress,
    totalLessons,
    totalEnrolled: withProgress.length,
    averageCompletion,
  });
}

async function listValidCategories(req, res) {
  return res.json({ categories: VALID_CATEGORIES });
}

async function getDashboardStats(req, res) {
  const [students, courses, enrollments, revenueResult] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  return res.json({
    students,
    courses,
    enrollments,
    revenue: revenueResult._sum.amount || 0,
  });
}

// GET /api/admin/students — every student, with enrollment count and total spent
async function listAllStudents(req, res) {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  const withSpend = await Promise.all(
    students.map(async (s) => {
      const spendResult = await prisma.payment.aggregate({
        where: { userId: s.id, status: "SUCCESS" },
        _sum: { amount: true },
      });
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        joinedAt: s.createdAt,
        enrollmentCount: s._count.enrollments,
        totalSpent: spendResult._sum.amount || 0,
      };
    })
  );

  return res.json({ students: withSpend });
}

// GET /api/admin/payments — every payment across all courses, most recent first
async function listAllPayments(req, res) {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  return res.json({ payments });
}

// GET /api/admin/analytics — revenue by month (last 6 months) + top courses by enrollment
async function getAnalytics(req, res) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS", verifiedAt: { gte: sixMonthsAgo } },
    select: { amount: true, verifiedAt: true },
  });

  const monthBuckets = {};
  for (const p of recentPayments) {
    const key = p.verifiedAt.toISOString().slice(0, 7); // "2026-07"
    monthBuckets[key] = (monthBuckets[key] || 0) + Number(p.amount);
  }
  const revenueByMonth = Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const courses = await prisma.course.findMany({
    select: {
      title: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });
  const topCourses = courses.map((c) => ({
    title: c.title,
    enrollments: c._count.enrollments,
  }));

  return res.json({ revenueByMonth, topCourses });
}

module.exports = {
  VALID_CATEGORIES,
  listAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  updateLesson,
  deleteLesson,
  listCourseEnrollments,
  listValidCategories,
  getDashboardStats,
  listAllStudents,
  listAllPayments,
  getAnalytics,
};
