const bookingService = require("../services/bookingService");
const { getLocationFromRequest } = require("../utils/location");
const mongoose = require("mongoose");
const BookingRequest = require("../models/BookingRequest"); // path check kar lena

/**
 * ============================================================
 * BOOKING CONTROLLER
 * ============================================================
 *
 * POST  /api/bookings
 * GET   /api/bookings
 * GET   /api/bookings/:id
 * PATCH /api/bookings/:id/status
 * GET   /api/bookings/admin/all
 *
 * ============================================================
 */

/**
 * ============================================================
 * CREATE BOOKING
 * ============================================================
 */
async function createBooking(req, res, next) {
  try {
    let {
      address,
      bookingDate,
      bookingTime,
      paymentMethod,
      paymentStatus,
      bookingStatus,
      totalAmount,
      products,

      // New fields from frontend payload
      job,
      serviceId,
      serviceName,
      pickupLocation,
      destinationLocation,
      distanceKm,
      estimatedCharge,
      estimatedArrival,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      workerId, // frontend se aayega (optional)
    } = req.body;

    console.log("========================================");
    console.log("CREATE BOOKING REQUEST");
    console.log("========================================");
    console.log("BODY:", JSON.stringify(req.body, null, 2));

    /**
     * ========================================================
     * USER CHECK
     * ========================================================
     */
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    /**
     * ========================================================
     * NORMALIZE ADDRESS
     * ========================================================
     */
    if (typeof address === "string") {
      const addressText = address.trim();

      if (addressText) {
        const parts = addressText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        let pincode = "";
        let state = "";
        let city = "";
        let houseNo = "";
        let landmark = "";

        const pincodeMatch = addressText.match(/\b\d{6}\b/);
        if (pincodeMatch) {
          pincode = pincodeMatch[0];
        }

        if (parts.length >= 1) houseNo = parts[0] || "";
        if (parts.length >= 2) landmark = parts[1] || "";
        if (parts.length >= 3) city = parts[2] || "";
        if (parts.length >= 4) state = parts[3] || "";

        address = {
          houseNo,
          landmark,
          city,
          state,
          pincode,
          fullAddress: addressText,
        };
      }
    }

    if (address && typeof address === "object" && !Array.isArray(address)) {
      address = {
        houseNo: address.houseNo || address.house || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pincode:
          address.pincode ||
          address.postalCode ||
          address.zipCode ||
          "",
        fullAddress: address.fullAddress || address.address || "",
      };
    }

    /**
     * ========================================================
     * LOCATION DETECTION
     * ========================================================
     */
    const needsDetection =
      !address || !address.city || !address.state || !address.pincode;

    if (needsDetection) {
      try {
        const detected = await getLocationFromRequest(req);
        if (detected) {
          address = Object.assign({}, address || {}, detected);
        }
      } catch (err) {
        console.error("Location detection failed:", err?.message || err);
      }
    }

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address is required.",
      });
    }

    /**
     * ========================================================
     * BOOKING TIME & DATE
     * ========================================================
     */
    if (!bookingTime) {
      bookingTime = new Date().toISOString();
    }

    if (!bookingDate) {
      const now = new Date();
      bookingDate = now.toISOString().split("T")[0];
    }

    if (!bookingDate) {
      return res.status(400).json({
        status: "error",
        message: "Booking date is required.",
      });
    }

    if (!bookingTime) {
      return res.status(400).json({
        status: "error",
        message: "Booking time is required.",
      });
    }

    /**
     * ========================================================
     * PRODUCTS
     * ========================================================
     */
    const safeProducts = Array.isArray(products) ? products : [];

    /**
     * ========================================================
     * EXTRACT LOCATION FOR WORKER MATCHING
     * ========================================================
     */
    let bookingLocation = null;

    if (pickupLocation && pickupLocation.latitude && pickupLocation.longitude) {
      bookingLocation = {
        type: "Point",
        coordinates: [
          parseFloat(pickupLocation.longitude),
          parseFloat(pickupLocation.latitude),
        ],
      };
      console.log("Booking location extracted:", bookingLocation);
    } else if (address && address.city && address.state) {
      console.log("No pickupLocation provided, using address for location");
    } else {
      console.log("No valid location provided for worker matching");
    }

    /**
     * ========================================================
     * MAP SERVICE ID TO PRODUCTS
     * ========================================================
     */
    if (
      safeProducts.length === 0 &&
      serviceId &&
      mongoose.isValidObjectId(serviceId)
    ) {
      safeProducts.push({
        productId: serviceId,
        quantity: 1,
        price: estimatedCharge || 0,
        serviceName: serviceName || job || "Service",
      });
    }

    /**
     * ========================================================
     * CREATE BOOKING
     * ========================================================
     */
    const booking = await bookingService.createBooking({
      userId: req.user.id,
      products: safeProducts,
      address,
      bookingDate,
      bookingTime,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus || "pending",
      bookingStatus: bookingStatus || "pending",
      totalAmount: Number(totalAmount) || Number(estimatedCharge) || 0,
      location: bookingLocation,
      serviceDetails: {
        job,
        serviceId,
        serviceName,
        pickupLocation,
        destinationLocation,
        distanceKm,
        estimatedCharge,
        estimatedArrival,
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    console.log("BOOKING CREATED SUCCESSFULLY:", booking?._id);
    console.log("========================================");

    /**
     * ========================================================
     * CREATE BOOKING REQUEST FOR WORKER (FIXED)
     * ========================================================
     */
    try {
      // Only create request if valid workerId is provided
      if (workerId && mongoose.isValidObjectId(workerId)) {
        // serviceId must be valid ObjectId
        let finalServiceId = null;

        if (serviceId && mongoose.isValidObjectId(serviceId)) {
          finalServiceId = serviceId;
        } else if (
          booking.products?.[0]?.productId &&
          mongoose.isValidObjectId(booking.products[0].productId)
        ) {
          finalServiceId = booking.products[0].productId;
        }

        if (!finalServiceId) {
          console.log("⚠️ Skipping BookingRequest: valid serviceId not found");
        } else {
          await BookingRequest.create({
            bookingId: booking._id,
            workerId: workerId,
            userId: booking.userId,
            serviceId: finalServiceId,
            distance: Number(distanceKm) || 0,
            status: "SENT",
            sentAt: new Date(),
          });

          console.log(
            "✅ BookingRequest created successfully for worker:",
            workerId
          );

          // Optional: Socket emit yahan kar sakte ho
          // io.to(workerId.toString()).emit("new_booking_request", { ... });
        }
      } else {
        console.log(
          "⚠️ No valid workerId provided. BookingRequest not created."
        );
      }
    } catch (requestErr) {
      console.error(
        "❌ BookingRequest creation failed:",
        requestErr.message
      );
      // Booking fail mat karo agar request create nahi hua
    }

    return res.status(201).json({
      status: "success",
      message: "Booking created successfully.",
      data: booking,
    });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err?.message || err);
    console.error("CREATE BOOKING STACK:", err?.stack || "");
    next(err);
  }
}

/**
 * ============================================================
 * GET LOGGED-IN USER BOOKINGS
 * ============================================================
 */
async function listBookings(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    const bookings = await bookingService.getBookingsByUser(req.user.id);

    return res.json({
      status: "success",
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ============================================================
 * GET SINGLE BOOKING
 * ============================================================
 */
async function getBooking(req, res, next) {
  try {
    const booking = await bookingService.getBooking(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found.",
      });
    }

    if (
      String(booking.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Access denied.",
      });
    }

    return res.json({
      status: "success",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ============================================================
 * UPDATE BOOKING STATUS
 * ============================================================
 */
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Booking status is required.",
      });
    }

    const booking = await bookingService.changeBookingStatus(
      req.params.id,
      status
    );

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found.",
      });
    }

    return res.json({
      status: "success",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ============================================================
 * ADMIN - GET ALL BOOKINGS
 * ============================================================
 */
async function adminAll(req, res, next) {
  try {
    const list = await bookingService.listAllBookings();

    return res.json({
      status: "success",
      data: list,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */
module.exports = {
  createBooking,
  listBookings,
  getBooking,
  updateStatus,
  adminAll,
};
