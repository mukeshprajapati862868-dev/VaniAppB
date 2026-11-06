const express = require("express");
const router = express.Router();

const {
  submitReview,
  getWorkerReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/auth"); // apna auth middleware

// Customer review submit karega
router.post("/", protect, submitReview);

// Public reviews (kisi ko bhi dikh sakta hai)
router.get("/worker/:workerId", getWorkerReviews);

module.exports = router;
