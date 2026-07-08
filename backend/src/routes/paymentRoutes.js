const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { initializePayment, verifyPayment } = require("../controllers/paymentController");

const router = express.Router();

router.post("/initialize", requireAuth, initializePayment);
router.get("/verify/:reference", requireAuth, verifyPayment);

module.exports = router;
