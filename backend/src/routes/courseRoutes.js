const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuth");
const { requireAuth } = require("../middleware/auth");
const {
  listCourses,
  listCategories,
  getCourseBySlug,
  listMyEnrolledCourses,
} = require("../controllers/courseController");
const { getCourseForLearning } = require("../controllers/lessonController");

const router = express.Router();

router.get("/", listCourses);
router.get("/categories", listCategories);
router.get("/me/enrolled", requireAuth, listMyEnrolledCourses);
router.get("/:slug/learn", requireAuth, getCourseForLearning);
router.get("/:slug", optionalAuth, getCourseBySlug);

module.exports = router;
