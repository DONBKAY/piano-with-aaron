const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getLesson, markLessonComplete } = require("../controllers/lessonController");

const router = express.Router();

router.get("/:lessonId", requireAuth, getLesson);
router.post("/:lessonId/complete", requireAuth, markLessonComplete);

module.exports = router;
