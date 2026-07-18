const express = require("express");

const {
  issueCertificate,
  getCourseCertificateStatus,
  listMyCertificates,
  verifyCertificate,
  downloadCertificate,
} = require("../controllers/certificateController");

const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ------------------------------------------------------------
// Public certificate verification
// ------------------------------------------------------------
router.get(
  "/verify/:certificateCode",
  verifyCertificate
);

// ------------------------------------------------------------
// Logged-in student's certificates
// ------------------------------------------------------------
router.get(
  "/my",
  requireAuth,
  listMyCertificates
);

// ------------------------------------------------------------
// Certificate status for a course
// ------------------------------------------------------------
router.get(
  "/course/:courseId/status",
  requireAuth,
  getCourseCertificateStatus
);

// ------------------------------------------------------------
// Issue certificate after course completion
// ------------------------------------------------------------
router.post(
  "/course/:courseId/issue",
  requireAuth,
  issueCertificate
);

// ------------------------------------------------------------
// Download certificate PDF
// ------------------------------------------------------------
router.get(
  "/:certificateCode/download",
  requireAuth,
  downloadCertificate
);

module.exports = router;
