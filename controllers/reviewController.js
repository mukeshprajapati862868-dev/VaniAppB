
const mongoose = require("mongoose");

const Review = require("../models/Review");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");

// ======================
// SUBMIT REVIEW
// ======================

exports.submitReview = async (req, res) => {
  try {

    const {
      bookingId,
      workerId,
      rating,
      comment,
    } = req.body;

    const customerId = req.user?._id || req.user?.id;

    // ======================
    // AUTHENTICATION CHECK
    // ======================

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    // ======================
    // REQUIRED FIELDS
    // ======================

    if (
      !bookingId ||
      !workerId ||
      rating === undefined ||
      rating === null ||
      !comment ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ======================
    // OBJECT ID VALIDATION
    // ======================

    if (
      !mongoose.Types.ObjectId.isValid(bookingId) ||
      !mongoose.Types.ObjectId.isValid(workerId) ||
      !mongoose.Types.ObjectId.isValid(customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking, Worker or Customer ID",
      });
    }

    // ======================
    // RATING VALIDATION
    // ======================

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // ======================
    // COMMENT VALIDATION
    // ======================

    const reviewComment = comment.trim();

    if (reviewComment.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 300 characters",
      });
    }

    // ======================
    // CHECK BOOKING
    // ======================

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ======================
    // CHECK CUSTOMER OWNERSHIP
    // ======================

    if (
      !booking.customerId ||
      booking.customerId.toString() !== customerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to review this booking",
      });
    }

    // ======================
    // CHECK BOOKING STATUS
    // ======================

    const bookingStatus = String(
      booking.status || ""
    ).toLowerCase();

    const allowedStatuses = [
      "completed",
      "delivered",
    ];

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "You can review only completed bookings",
      });
    }

    // ======================
    // CHECK ASSIGNED WORKER
    // ======================

    if (
      !booking.workerId ||
      booking.workerId.toString() !== workerId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Worker does not belong to this booking",
      });
    }

    // ======================
    // CHECK WORKER
    // ======================

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // ======================
    // ALREADY REVIEWED CHECK
    // ======================

    const alreadyReviewed = await Review.findOne({
      bookingId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // ======================
    // CREATE REVIEW
    // ======================

    let review;

    try {

      review = await Review.create({
        customerId,
        workerId,
        bookingId,
        rating: numericRating,
        comment: reviewComment,
      });

    } catch (createError) {

      // Unique index duplicate protection
      if (createError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this booking",
        });
      }

      throw createError;
    }

    // ======================
    // UPDATE WORKER RATING
    // ATOMIC AVERAGE CALCULATION
    // ======================

    const updatedWorker = await Worker.findByIdAndUpdate(
      workerId,
      [
        {
          $set: {
            rating: {
              $round: [
                {
                  $divide: [
                    {
                      $add: [
                        {
                          $multiply: [
                            { $ifNull: ["$rating", 0] },
                            { $ifNull: ["$totalReviews", 0] },
                          ],
                        },
                        numericRating,
                      ],
                    },
                    {
                      $add: [
                        { $ifNull: ["$totalReviews", 0] },
                        1,
                      ],
                    },
                  ],
                },
                1,
              ],
            },

            totalReviews: {
              $add: [
                { $ifNull: ["$totalReviews", 0] },
                1,
              ],
            },
          },
        },
      ],
      {
        new: true,
      }
    );

    if (!updatedWorker) {
      // Roll back the review if worker update fails
      await Review.findByIdAndDelete(review._id);

      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // ======================
    // SUCCESS RESPONSE
    // ======================

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",

      data: {
        review,

        workerRating: updatedWorker.rating,

        totalReviews: updatedWorker.totalReviews,
      },
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

    // ======================
    // VALIDATE WORKER ID
    // ======================

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Worker ID",
      });
    }

    // ======================
    // CHECK WORKER
    // ======================

    const worker = await Worker.findById(workerId)
      .select("rating totalReviews name");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // ======================
    // GET REVIEWS
    // ======================

    const reviews = await Review.find({
      workerId,
    })
      .populate("customerId", "name")
      .sort({
        createdAt: -1,
      })
      .select("rating comment customerId createdAt");

    // ======================
    // FORMAT REVIEWS
    // ======================

    const formattedReviews = reviews.map((r) => ({
      rating: r.rating,

      comment: r.comment,

      customerName: r.customerId?.name || "Customer",

      createdAt: r.createdAt,
    }));

    // ======================
    // RESPONSE
    // ======================

    return res.status(200).json({

      success: true,

      data: {

        averageRating: worker.rating || 0,

        totalReviews: worker.totalReviews || 0,

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
