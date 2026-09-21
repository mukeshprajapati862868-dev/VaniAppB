const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // =====================================================
    // WORKER PASSWORD
    // =====================================================
    // IMPORTANT:
    // Password plain text mein kabhi save nahi hoga.
    // Registration par bcrypt hash save hoga.
    // Login mein .select("+passwordHash") use hoga.
    // =====================================================

    passwordHash: {
      type: String,
      required: true,
      select: false,
      trim: true,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // SERVICES
    // =====================================================

    serviceCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // KYC
    // =====================================================

    kycDocuments: {
      aadhaar: {
        type: String,
        default: "",
      },

      pan: {
        type: String,
        default: "",
      },

      certificate: {
        type: String,
        default: "",
      },
    },

    // =====================================================
    // AVAILABILITY
    // =====================================================

    availabilityStatus: {
      type: String,
      enum: ["ON", "OFF"],
      default: "OFF",
    },

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "blocked",
      ],
      default: "pending",
    },

    // =====================================================
    // JOB STATISTICS
    // =====================================================

    totalJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // =====================================================
    // ROLE
    // =====================================================

    role: {
      type: String,
      enum: ["worker"],
      default: "worker",
    },

    // =====================================================
    // LOCATION
    // =====================================================

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// GEO LOCATION INDEX
// =====================================================

workerSchema.index({
  location: "2dsphere",
});

// =====================================================
// EXPORT MODEL SAFELY
// =====================================================

module.exports =
  mongoose.models.Worker ||
  mongoose.model("Worker", workerSchema);