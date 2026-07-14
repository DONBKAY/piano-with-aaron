const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
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
} = require("../controllers/adminCourseController");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/categories", listValidCategories);

router.get("/courses", listAllCourses);
router.get("/courses/:id", getCourseById);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.get("/courses/:courseId/enrollments", listCourseEnrollments);

router.post("/courses/:courseId/sections", createSection);
router.put("/sections/:sectionId", updateSection);
router.delete("/sections/:sectionId", deleteSection);

router.post("/sections/:sectionId/lessons", createLesson);
router.put("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);

module.exports = router;
