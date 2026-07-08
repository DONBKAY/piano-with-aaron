const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

// Sanity-check route: only logged-in ADMIN users can reach this.
// Real admin endpoints (create course, view enrollments, etc.) get added in Phase 2/5.
router.get("/ping", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ message: `Welcome, admin ${req.user.email}` });
});

module.exports = router;
