const Review = require("../models/Review");
const Worker = require("../models/Worker");

// ======================
// SUBMIT REVIEW
// ======================
exports.submitReview = async (req, res) => {
  try {
    const { bookingId, workerId, rating, comment } = req.body;
    const customerId = req.user._id;

    if (!bookingId || !workerId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Already reviewed check
    const alreadyReviewed = await Review.findOne({ bookingId });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Create review
    const review = await Review.create({
      customerId,
      workerId,
      bookingId,
      rating,
      comment: comment.trim(),
    });

    // Update Worker rating + totalReviews
    const allReviews = await Review.find({ workerId });
    const totalReviews = allReviews.length;
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await Worker.findByIdAndUpdate(workerId, {
      rating: Number(averageRating.toFixed(1)),
      totalReviews: totalReviews,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Submit Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ======================
// GET PUBLIC REVIEWS
// ======================
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ workerId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .select("rating comment customerId createdAt");

    const worker = await Worker.findById(workerId).select("rating totalReviews name");

    const formattedReviews = reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment,
      customerName: r.customerId?.name || "Customer",
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        averageRating: worker?.rating || 0,
        totalReviews: worker?.totalReviews || 0,
        reviews: formattedReviews,
      },
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
