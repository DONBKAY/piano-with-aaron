const prisma = require("../config/db");

// GET /api/courses?category=&subcategory=&search=
// Public: only returns published courses
async function listCourses(req, res) {
  const { category, subcategory, search } = req.query;

  const where = {
    published: true,
    ...(category && { category }),
    ...(subcategory && { subcategory }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
      _count: { select: { sections: true, enrollments: true } },
    },
  });

  return res.json({ courses });
}

// GET /api/courses/categories — used to build homepage/nav category cards
async function listCategories(req, res) {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { category: true, subcategory: true },
    distinct: ["category", "subcategory"],
  });

  const grouped = {};
  for (const c of courses) {
    if (!grouped[c.category]) grouped[c.category] = new Set();
    grouped[c.category].add(c.subcategory);
  }

  const result = Object.entries(grouped).map(([category, subs]) => ({
    category,
    subcategories: [...subs],
  }));

  return res.json({ categories: result });
}

// GET /api/courses/:slug — full curriculum. Video URLs are hidden for
// non-preview lessons unless the requester is enrolled (checked via optional
// auth) — full enrollment gating on the video itself is enforced again on
// the lesson-player route in Phase 4, this is a UX-level hide, not the only guard.
async function getCourseBySlug(req, res) {
  const { slug } = req.params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
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
    return res.status(404).json({ error: "Course not found" });
  }

  let isEnrolled = false;
  if (req.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
    });
    isEnrolled = Boolean(enrollment) || req.user.role === "ADMIN";
  }

  // Strip video/pdf URLs for lessons the viewer isn't allowed to watch yet
  const sanitized = {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        videoUrl: lesson.isPreview || isEnrolled ? lesson.videoUrl : null,
        pdfUrl: lesson.isPreview || isEnrolled ? lesson.pdfUrl : null,
        locked: !(lesson.isPreview || isEnrolled),
      })),
    })),
  };

  return res.json({ course: sanitized, isEnrolled });
}

// GET /api/courses/me/enrolled  (auth required)
// Powers "My Courses" — avoids the client having to check enrollment
// status course-by-course.
async function listMyEnrolledCourses(req, res) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
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
          _count: { select: { sections: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ courses: enrollments.map((e) => e.course) });
}

module.exports = { listCourses, listCategories, getCourseBySlug, listMyEnrolledCourses };
