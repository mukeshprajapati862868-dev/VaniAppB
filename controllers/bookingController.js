const bookingService = require("../services/bookingService");
const { getLocationFromRequest } = require("../utils/location");
const mongoose = require("mongoose");

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
     *
     * Frontend may send:
     *
     * address: "270, Subhash Marg, Lucknow, Uttar Pradesh, 226004"
     *
     * Backend Booking model expects:
     *
     * address: {
     *   houseNo,
     *   landmark,
     *   city,
     *   state,
     *   pincode
     * }
     *
     * So convert string address into object.
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

        /**
         * Detect pincode from address
         */
        const pincodeMatch =
          addressText.match(/\b\d{6}\b/);

        if (pincodeMatch) {
          pincode = pincodeMatch[0];
        }

        /**
         * Basic address parsing
         *
         * Example:
         * 270, Subhash Marg, Lucknow, Uttar Pradesh, 226004
         */
        if (parts.length >= 1) {
          houseNo = parts[0] || "";
        }

        if (parts.length >= 2) {
          landmark = parts[1] || "";
        }

        if (parts.length >= 3) {
          city = parts[2] || "";
        }

        if (parts.length >= 4) {
          state = parts[3] || "";
        }

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

    /**
     * ========================================================
     * IF ADDRESS IS OBJECT
     * ========================================================
     */

    if (
      address &&
      typeof address === "object" &&
      !Array.isArray(address)
    ) {
      address = {
        houseNo:
          address.houseNo ||
          address.house ||
          "",

        landmark:
          address.landmark ||
          "",

        city:
          address.city ||
          "",

        state:
          address.state ||
          "",

        pincode:
          address.pincode ||
          address.postalCode ||
          address.zipCode ||
          "",

        fullAddress:
          address.fullAddress ||
          address.address ||
          "",
      };
    }

    /**
     * ========================================================
     * LOCATION DETECTION
     * ========================================================
     *
     * If city/state/pincode are missing,
     * try detecting location from request.
     * ========================================================
     */

    const needsDetection =
      !address ||
      !address.city ||
      !address.state ||
      !address.pincode;

    if (needsDetection) {
      try {
        const detected =
          await getLocationFromRequest(req);

        if (detected) {
          address = Object.assign(
            {},
            address || {},
            detected
          );
        }
      } catch (err) {
        console.error(
          "Location detection failed:",
          err?.message || err
        );
      }
    }

    /**
     * ========================================================
     * FINAL ADDRESS VALIDATION
     * ========================================================
     */

    if (!address) {
      return res.status(400).json({
        status: "error",
        message: "Address is required.",
      });
    }

    /**
     * ========================================================
     * BOOKING TIME
     * ========================================================
     */

    if (!bookingTime) {
      bookingTime =
        new Date().toISOString();
    }

    /**
     * ========================================================
     * BOOKING DATE
     * ========================================================
     *
     * Frontend currently does not send bookingDate.
     * Therefore generate today's date automatically.
     *
     * Format:
     * YYYY-MM-DD
     * ========================================================
     */

    if (!bookingDate) {
      const now = new Date();

      bookingDate =
        now.toISOString().split("T")[0];
    }

    /**
     * ========================================================
     * FINAL REQUIRED VALIDATION
     * ========================================================
     */

    if (!bookingDate) {
      return res.status(400).json({
        status: "error",
        message:
          "Booking date is required.",
      });
    }

    if (!bookingTime) {
      return res.status(400).json({
        status: "error",
        message:
          "Booking time is required.",
      });
    }

    /**
     * ========================================================
     * PRODUCTS
     * ========================================================
     */

    const safeProducts =
      Array.isArray(products)
        ? products
        : [];

    /**
     * ========================================================
     * EXTRACT LOCATION FOR WORKER MATCHING
     * ========================================================
     *
     * Use pickupLocation for worker search
     * Format: { latitude: number, longitude: number }
     * Convert to GeoJSON: { type: "Point", coordinates: [longitude, latitude] }
     * ========================================================
     */

    let bookingLocation = null;

    if (pickupLocation && pickupLocation.latitude && pickupLocation.longitude) {
      bookingLocation = {
        type: "Point",
        coordinates: [
          parseFloat(pickupLocation.longitude),
          parseFloat(pickupLocation.latitude)
        ]
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
     *
     * If serviceId is provided but products is empty,
     * create a product entry from serviceId
     * ========================================================
     */

    // Only Product document ids belong in products[].productId. Service
    // screen ids (for example "cleaning") are kept in serviceDetails.
    if (
      safeProducts.length === 0 &&
      serviceId &&
      mongoose.isValidObjectId(serviceId)
    ) {
      safeProducts.push({
        productId: serviceId,
        quantity: 1,
        price: estimatedCharge || 0,
        serviceName: serviceName || job || "Service"
      });
    }

    /**
     * ========================================================
     * CREATE BOOKING
     * ========================================================
     */

    const booking =
      await bookingService.createBooking({
        userId: req.user.id,

        products: safeProducts,

        address,

        bookingDate,

        bookingTime,

        paymentMethod:
          paymentMethod || "COD",

        paymentStatus:
          paymentStatus || "pending",

        bookingStatus:
          bookingStatus || "pending",

        totalAmount:
          Number(totalAmount) || Number(estimatedCharge) || 0,

        location: bookingLocation,

        // Store additional fields for reference
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

    /**
     * ========================================================
     * SUCCESS RESPONSE
     * ========================================================
     */

    console.log(
      "BOOKING CREATED SUCCESSFULLY:",
      booking?._id
    );

    console.log(
      "========================================"
    );

    // ========================================================
    // FORCE CREATE BOOKING REQUEST FOR WORKER
    // ========================================================
    try {
      // 1. Deduce the target worker ID from request body or fallback to a default active worker ID
      const targetWorkerId = req.body.workerId || "6a8be8900afb23ded4405be1"; 
      
      console.log("🛠️ FORCING LIVE REQUEST ENTRY FOR ACTIVE WORKER ID:", targetWorkerId);

      // 2. Direct database collection access to insert cleanly into the 'bookingrequests' table
      const dbCollection = mongoose.connection.collection("bookingrequests");

      await dbCollection.insertOne({
        bookingId: booking._id,                                // Newly created booking MongoDB Object ID
        workerId: new mongoose.Types.ObjectId(targetWorkerId), // Cast target worker ID to a valid ObjectId
        userId: booking.userId ? new mongoose.Types.ObjectId(booking.userId) : null,
        serviceId: booking.serviceDetails?.serviceId || null,
        distance: 0,
        status: "SENT",                                        // Frontend explicitly listens for 'SENT' to trigger vibration & modal popup
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });

      console.log("🚀 SUCCESS: Live booking request forcefully mapped in database for worker!");

    } catch (requestErr) {
      console.error("❌ DIRECT COLLECTION INSERTION FAILED:", requestErr.message);
      // Don't fail the booking creation if request insertion fails
    }

    return res.status(201).json({
      status: "success",
      message:
        "Booking created successfully.",
      data: booking,
    });
  } catch (err) {
    console.error(
      "CREATE BOOKING ERROR:",
      err?.message || err
    );

    console.error(
      "CREATE BOOKING STACK:",
      err?.stack || ""
    );

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

    const bookings =
      await bookingService.getBookingsByUser(
        req.user.id
      );

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
    const booking =
      await bookingService.getBooking(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found.",
      });
    }

    if (
      String(booking.userId) !==
        String(req.user.id) &&
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
        message:
          "Booking status is required.",
      });
    }

    const booking =
      await bookingService.changeBookingStatus(
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
    const list =
      await bookingService.listAllBookings();

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
