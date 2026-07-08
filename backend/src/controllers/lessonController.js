const prisma = require("../config/db");

// Shared helper: does this user have access to this course's full content?
async function hasAccess(userId, userRole, courseId) {
  if (userRole === "ADMIN") return true;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return Boolean(enrollment);
}

// GET /api/courses/:slug/learn  (auth required)
// The entry point for the lesson player: full curriculum + per-lesson
// completion state. Unlike the public course-detail endpoint, this one
// REQUIRES enrollment (or preview-only access) rather than just hiding URLs —
// this is the real access-control boundary for lesson content.
async function getCourseForLearning(req, res) {
  const { slug } = req.params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) return res.status(404).json({ error: "Course not found" });

  const enrolled = await hasAccess(req.user.id, req.user.role, course.id);

  if (!enrolled) {
    // Not enrolled: only expose preview lessons, no full lesson list details
    const previewOnly = {
      ...course,
      sections: course.sections.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          isPreview: l.isPreview,
          videoUrl: l.isPreview ? l.videoUrl : null,
          locked: !l.isPreview,
        })),
      })),
    };
    return res.status(200).json({ course: previewOnly, enrolled: false });
  }

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId: req.user.id, lesson: { section: { courseId: course.id } } },
    select: { lessonId: true, completed: true },
  });
  const completedSet = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));

  const enriched = {
    ...course,
    sections: course.sections.map((s) => ({
      ...s,
      lessons: s.lessons.map((l) => ({
        ...l,
        locked: false,
        completed: completedSet.has(l.id),
      })),
    })),
  };

  const totalLessons = enriched.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedCount = completedSet.size;

  return res.json({
    course: enriched,
    enrolled: true,
    progress: {
      completed: completedCount,
      total: totalLessons,
      percent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
    },
  });
}

// GET /api/lessons/:lessonId  (auth required)
// Fetches a single lesson's full detail (video/pdf URL), enforcing
// enrollment. This is the actual gate — a student can't get a real video
// URL for a lesson they haven't paid for, no matter what the frontend does.
async function getLesson(req, res) {
  const { lessonId } = req.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  });

  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const course = lesson.section.course;

  if (!lesson.isPreview) {
    const allowed = await hasAccess(req.user.id, req.user.role, course.id);
    if (!allowed) {
      return res.status(403).json({ error: "Enroll in this course to access this lesson" });
    }
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
  });

  return res.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      pdfUrl: lesson.pdfUrl,
      durationSec: lesson.durationSec,
      isPreview: lesson.isPreview,
      sectionId: lesson.sectionId,
    },
    course: { id: course.id, slug: course.slug, title: course.title },
    completed: progress?.completed || false,
  });
}

// POST /api/lessons/:lessonId/complete  (auth required)
async function markLessonComplete(req, res) {
  const { lessonId } = req.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: true },
  });
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const allowed =
    lesson.isPreview || (await hasAccess(req.user.id, req.user.role, lesson.section.courseId));
  if (!allowed) {
    return res.status(403).json({ error: "Enroll in this course to track progress" });
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: req.user.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: req.user.id, lessonId, completed: true, completedAt: new Date() },
  });

  return res.json({ progress });
}

module.exports = { getCourseForLearning, getLesson, markLessonComplete };
