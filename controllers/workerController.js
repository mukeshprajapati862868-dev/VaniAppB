const workerService = require("../services/workerService");
const workerMatchingService = require("../services/workerMatchingService");
const Worker = require("../models/Worker");

// =====================================================
// REGISTER WORKER
// =====================================================

exports.register = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await workerService.registerWorker(
        req.body
      );

    return res.status(201).json({
      status: "success",

      message:
        "Worker registered successfully",

      data: result,
    });
  } catch (err) {
    // Handle MongoDB duplicate key errors cleanly
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        status: "error",
        message: `Worker with this ${field} already exists.`,
      });
    }
    next(err);
  }
};

// =====================================================
// WORKER LOGIN
// =====================================================

exports.login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",

        message:
          "Email and password are required.",
      });
    }

    const result =
      await workerService.loginWorker(
        email.trim().toLowerCase(),
        password
      );

    return res.status(200).json({
      status: "success",

      message:
        "Worker login successful",

      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// PROFILE
// =====================================================

exports.profile = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await workerService.getProfile(
        req.user.id
      );

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

exports.updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await workerService.updateProfile(
        req.user.id,
        req.body
      );

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// UPDATE KYC
// =====================================================

exports.updateKYC = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await workerService.updateKYC(
        req.user.id,
        req.body
      );

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// AVAILABILITY
// =====================================================

exports.availability = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await workerService.updateAvailability(
        req.user.id,
        req.body.status
      );

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// SERVICE LIST
// =====================================================

exports.services = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await workerService.getServices();

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// SELECT SERVICES
// =====================================================

exports.selectServices = async (
  req,
  res,
  next
) => {
  try {
    const services =
      req.body.services;

    if (!Array.isArray(services)) {
      return res.status(400).json({
        status: "error",
        message:
          "Services must be an array.",
      });
    }

    const data =
      await workerService.selectServices(
        req.user.id,
        services
      );

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// GET BOOKING REQUESTS
// =====================================================

exports.getBookingRequests = async (
  req,
  res,
  next
) => {
  try {
    const worker =
      await Worker.findById(
        req.user.id
      );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message:
          "Worker profile not found.",
      });
    }

    if (
      worker.status !== "approved"
    ) {
      return res.status(403).json({
        status: "error",
        message:
          "Your worker profile is awaiting admin approval.",
      });
    }

    const requests =
      await workerMatchingService.getWorkerRequests(
        worker._id
      );

    return res.status(200).json({
      status: "success",
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// ACCEPT BOOKING REQUEST
// =====================================================

exports.acceptBookingRequest =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        requestId,
      } = req.params;

      const worker =
        await Worker.findById(
          req.user.id
        );

      if (!worker) {
        return res.status(404).json({
          status: "error",
          message:
            "Worker profile not found.",
        });
      }

      if (
        worker.status !==
          "approved" ||
        worker.availabilityStatus !==
          "ON"
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only approved, online workers can accept bookings.",
        });
      }

      const result =
        await workerMatchingService.acceptBookingRequest(
          requestId,
          worker._id
        );

      return res.status(200).json({
        status: "success",
        message:
          "Booking accepted successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

// =====================================================
// REJECT BOOKING REQUEST
// =====================================================

exports.rejectBookingRequest =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        requestId,
      } = req.params;

      const worker =
        await Worker.findById(
          req.user.id
        );

      if (!worker) {
        return res.status(404).json({
          status: "error",
          message:
            "Worker profile not found.",
        });
      }

      const result =
        await workerMatchingService.rejectBookingRequest(
          requestId,
          worker._id
        );

      return res.status(200).json({
        status: "success",
        message:
          "Booking rejected successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

// =====================================================
// GET ASSIGNED BOOKING
// =====================================================

exports.getAssignedBooking =
  async (
    req,
    res,
    next
  ) => {
    try {
      const worker =
        await Worker.findById(
          req.user.id
        );

      if (!worker) {
        return res.status(404).json({
          status: "error",
          message:
            "Worker profile not found.",
        });
      }

      const booking =
        await workerMatchingService.getAssignedBooking(
          worker._id
        );

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message:
            "No assigned booking found.",
        });
      }

      return res.status(200).json({
        status: "success",
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  };

// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

exports.updateBookingStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        bookingId,
      } = req.params;

      const {
        status,
      } = req.body;

      if (!status) {
        return res.status(400).json({
          status: "error",
          message:
            "Status is required.",
        });
      }

      const worker =
        await Worker.findById(
          req.user.id
        );

      if (!worker) {
        return res.status(404).json({
          status: "error",
          message:
            "Worker profile not found.",
        });
      }

      const booking =
        await workerMatchingService.updateBookingStatus(
          bookingId,
          worker._id,
          status
        );

      return res.status(200).json({
        status: "success",
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  };

// =====================================================
// UPDATE LOCATION
// =====================================================

exports.updateLocation = async (
  req,
  res,
  next
) => {
  try {
    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Latitude and longitude are required.",
      });
    }

    const worker =
      await Worker.findById(
        req.user.id
      );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message:
          "Worker profile not found.",
      });
    }

    const updatedWorker =
      await workerService.updateLocation(
        worker._id,
        [
          Number(longitude),
          Number(latitude),
        ]
      );

    return res.status(200).json({
      status: "success",
      message:
        "Location updated successfully",
      data: updatedWorker,
    });
  } catch (err) {
    next(err);
  }
};