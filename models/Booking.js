const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },

    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    bookingId: {
      type: String,
      unique: true,
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],

    address: {
      houseNo: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },

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

    serviceDetails: {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
      serviceName: String,
      description: String,
    },

    bookingDate: String,
    bookingTime: String,

    paymentMethod: {
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "SEARCHING_WORKER",
        "accepted",
        "rejected",
        "started",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    workProof: {
      images: [String],
      notes: String,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ location: "2dsphere" });

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);