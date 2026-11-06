
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per booking
reviewSchema.index(
  { bookingId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);
