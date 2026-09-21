const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Category wise grouping
    category: {
      type: String,
      required: true,
      enum: [
        "Man",
        "Woman",
        "Plumber",
        "AC Repair",
        "Electrician",
        "Cleaning",
        "Other"
      ],
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Optional: for sorting inside category
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster category filtering
serviceSchema.index({ category: 1, status: 1 });

module.exports =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);