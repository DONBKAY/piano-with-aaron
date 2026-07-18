const express = require("express");

const {
  issueCertificate,
  getCourseCertificateStatus,
  listMyCertificates,
  verifyCertificate,
} = require("../controllers/certificateController");

const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Verify a certificate by its unique certificate code.
router.get(
  "/verify/:certificateCode",
  verifyCertificate
);

/*
|--------------------------------------------------------------------------
| Student Routes
|--------------------------------------------------------------------------
*/

// Get all certificates belonging to the logged-in student.
router.get(
  "/my",
  requireAuth,
  listMyCertificates
);

// Check whether a student is eligible for a certificate.
router.get(
  "/course/:courseId/status",
  requireAuth,
  getCourseCertificateStatus
);

// Issue a certificate once the course is completed.
router.post(
  "/course/:courseId/issue",
  requireAuth,
  issueCertificate
);

module.exports = router;
