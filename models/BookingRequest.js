// const mongoose = require("mongoose");

// const bookingRequestSchema = new mongoose.Schema(
//   {
//     bookingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Booking",
//       required: true,
//     },

//     workerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Worker",
//       required: true,
//     },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     serviceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Service",
//       required: true,
//     },

//     distance: {
//       type: Number,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: [
//         "PENDING",
//         "SENT",
//         "ACCEPTED",
//         "REJECTED",
//         "EXPIRED",
//         "CANCELLED",
//       ],
//       default: "PENDING",
//     },

//     sentAt: {
//       type: Date,
//       default: null,
//     },

//     acceptedAt: {
//       type: Date,
//       default: null,
//     },

//     rejectedAt: {
//       type: Date,
//       default: null,
//     },

//     expiredAt: {
//       type: Date,
//       default: null,
//     },

//     cancelledAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// bookingRequestSchema.index({ bookingId: 1, workerId: 1 }, { unique: true });
// bookingRequestSchema.index({ workerId: 1, status: 1 });
// bookingRequestSchema.index({ bookingId: 1, status: 1 });

// module.exports =
//   mongoose.models.BookingRequest ||
//   mongoose.model("BookingRequest", bookingRequestSchema);





const mongoose = require("mongoose");

const bookingRequestSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ========================================================
    // CUSTOMER DETAILS
    // ========================================================
    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // CUSTOMER ADDRESS
    // ========================================================
    customerAddress: {
      houseNo: {
        type: String,
        default: "",
      },

      landmark: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },

      fullAddress: {
        type: String,
        default: "",
      },
    },

    // ========================================================
    // DISTANCE
    // ========================================================
    distance: {
      type: Number,
      required: true,
      default: 0,
    },

    // ========================================================
    // REQUEST STATUS
    // ========================================================
    status: {
      type: String,
      enum: [
        "PENDING",
        "SENT",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    sentAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

bookingRequestSchema.index(
  { bookingId: 1, workerId: 1 },
  { unique: true }
);

bookingRequestSchema.index({
  workerId: 1,
  status: 1,
});

bookingRequestSchema.index({
  bookingId: 1,
  status: 1,
});

// ============================================================
// EXPORT
// ============================================================

module.exports =
  mongoose.models.BookingRequest ||
  mongoose.model("BookingRequest", bookingRequestSchema);
