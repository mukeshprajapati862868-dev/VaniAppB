// const workerService = require("../services/workerService");
// const workerMatchingService = require("../services/workerMatchingService");
// const Worker = require("../models/Worker");

// // =====================================================
// // REGISTER WORKER
// // =====================================================

// exports.register = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const result =
//       await workerService.registerWorker(
//         req.body
//       );

//     return res.status(201).json({
//       status: "success",

//       message:
//         "Worker registered successfully",

//       data: result,
//     });
//   } catch (err) {
//     // Handle MongoDB duplicate key errors cleanly
//     if (err.code === 11000) {
//       const field = Object.keys(err.keyPattern || {})[0] || 'field';
//       return res.status(409).json({
//         status: "error",
//         message: `Worker with this ${field} already exists.`,
//       });
//     }
//     next(err);
//   }
// };

// // =====================================================
// // WORKER LOGIN
// // =====================================================

// exports.login = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const {
//       email,
//       password,
//     } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         status: "error",

//         message:
//           "Email and password are required.",
//       });
//     }

//     const result =
//       await workerService.loginWorker(
//         email.trim().toLowerCase(),
//         password
//       );

//     return res.status(200).json({
//       status: "success",

//       message:
//         "Worker login successful",

//       data: result,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // PROFILE
// // =====================================================

// exports.profile = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await workerService.getProfile(
//         req.user.id
//       );

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // UPDATE PROFILE
// // =====================================================

// exports.updateProfile = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await workerService.updateProfile(
//         req.user.id,
//         req.body
//       );

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // UPDATE KYC
// // =====================================================

// exports.updateKYC = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await workerService.updateKYC(
//         req.user.id,
//         req.body
//       );

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // AVAILABILITY
// // =====================================================

// exports.availability = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await workerService.updateAvailability(
//         req.user.id,
//         req.body.status
//       );

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // SERVICE LIST
// // =====================================================

// exports.services = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const data =
//       await workerService.getServices();

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // SELECT SERVICES
// // =====================================================

// exports.selectServices = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const services =
//       req.body.services;

//     if (!Array.isArray(services)) {
//       return res.status(400).json({
//         status: "error",
//         message:
//           "Services must be an array.",
//       });
//     }

//     const data =
//       await workerService.selectServices(
//         req.user.id,
//         services
//       );

//     return res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // GET BOOKING REQUESTS
// // =====================================================

// exports.getBookingRequests = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const worker =
//       await Worker.findById(
//         req.user.id
//       );

//     if (!worker) {
//       return res.status(404).json({
//         status: "error",
//         message:
//           "Worker profile not found.",
//       });
//     }

//     if (
//       worker.status !== "approved"
//     ) {
//       return res.status(403).json({
//         status: "error",
//         message:
//           "Your worker profile is awaiting admin approval.",
//       });
//     }

//     const requests =
//       await workerMatchingService.getWorkerRequests(
//         worker._id
//       );

//     return res.status(200).json({
//       status: "success",
//       data: requests,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // ACCEPT BOOKING REQUEST
// // =====================================================

// exports.acceptBookingRequest =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const {
//         requestId,
//       } = req.params;

//       const worker =
//         await Worker.findById(
//           req.user.id
//         );

//       if (!worker) {
//         return res.status(404).json({
//           status: "error",
//           message:
//             "Worker profile not found.",
//         });
//       }

//       if (
//         worker.status !==
//           "approved" ||
//         worker.availabilityStatus !==
//           "ON"
//       ) {
//         return res.status(403).json({
//           status: "error",
//           message:
//             "Only approved, online workers can accept bookings.",
//         });
//       }

//       const result =
//         await workerMatchingService.acceptBookingRequest(
//           requestId,
//           worker._id
//         );

//       return res.status(200).json({
//         status: "success",
//         message:
//           "Booking accepted successfully",
//         data: result,
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

// // =====================================================
// // REJECT BOOKING REQUEST
// // =====================================================

// exports.rejectBookingRequest =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const {
//         requestId,
//       } = req.params;

//       const worker =
//         await Worker.findById(
//           req.user.id
//         );

//       if (!worker) {
//         return res.status(404).json({
//           status: "error",
//           message:
//             "Worker profile not found.",
//         });
//       }

//       const result =
//         await workerMatchingService.rejectBookingRequest(
//           requestId,
//           worker._id
//         );

//       return res.status(200).json({
//         status: "success",
//         message:
//           "Booking rejected successfully",
//         data: result,
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

// // =====================================================
// // GET ASSIGNED BOOKING
// // =====================================================

// exports.getAssignedBooking =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const worker =
//         await Worker.findById(
//           req.user.id
//         );

//       if (!worker) {
//         return res.status(404).json({
//           status: "error",
//           message:
//             "Worker profile not found.",
//         });
//       }

//       const booking =
//         await workerMatchingService.getAssignedBooking(
//           worker._id
//         );

//       if (!booking) {
//         return res.status(404).json({
//           status: "error",
//           message:
//             "No assigned booking found.",
//         });
//       }

//       return res.status(200).json({
//         status: "success",
//         data: booking,
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

// // =====================================================
// // UPDATE BOOKING STATUS
// // =====================================================

// exports.updateBookingStatus =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const {
//         bookingId,
//       } = req.params;

//       const {
//         status,
//       } = req.body;

//       if (!status) {
//         return res.status(400).json({
//           status: "error",
//           message:
//             "Status is required.",
//         });
//       }

//       const worker =
//         await Worker.findById(
//           req.user.id
//         );

//       if (!worker) {
//         return res.status(404).json({
//           status: "error",
//           message:
//             "Worker profile not found.",
//         });
//       }

//       const booking =
//         await workerMatchingService.updateBookingStatus(
//           bookingId,
//           worker._id,
//           status
//         );

//       return res.status(200).json({
//         status: "success",
//         data: booking,
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

// // =====================================================
// // UPDATE LOCATION
// // =====================================================

// exports.updateLocation = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const {
//       latitude,
//       longitude,
//     } = req.body;

//     if (
//       latitude === undefined ||
//       longitude === undefined
//     ) {
//       return res.status(400).json({
//         status: "error",
//         message:
//           "Latitude and longitude are required.",
//       });
//     }

//     const worker =
//       await Worker.findById(
//         req.user.id
//       );

//     if (!worker) {
//       return res.status(404).json({
//         status: "error",
//         message:
//           "Worker profile not found.",
//       });
//     }

//     const updatedWorker =
//       await workerService.updateLocation(
//         worker._id,
//         [
//           Number(longitude),
//           Number(latitude),
//         ]
//       );

//     return res.status(200).json({
//       status: "success",
//       message:
//         "Location updated successfully",
//       data: updatedWorker,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// //NEW CONTROLLER ADD 
// // =====================================================
// // WORKER JOB STATISTICS
// // =====================================================

// exports.getJobStats = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const worker = await Worker.findById(
//       req.user.id
//     );

//     if (!worker) {
//       return res.status(404).json({
//         status: "error",
//         message: "Worker profile not found.",
//       });
//     }

//     const stats =
//       await workerMatchingService.getWorkerJobStats(
//         worker._id
//       );

//     return res.status(200).json({
//       status: "success",
//       data: stats,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =====================================================
// // WORKER COMPLETED JOBS
// // =====================================================

// exports.getCompletedJobs = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const worker = await Worker.findById(
//       req.user.id
//     );

//     if (!worker) {
//       return res.status(404).json({
//         status: "error",
//         message: "Worker profile not found.",
//       });
//     }

//     const jobs =
//       await workerMatchingService.getWorkerCompletedJobs(
//         worker._id
//       );

//     return res.status(200).json({
//       status: "success",
//       data: jobs,
//     });
//   } catch (err) {
//     next(err);
//   }
// };








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
      message: "Worker registered successfully",
      data: result,
    });
  } catch (err) {
    // Handle MongoDB duplicate key errors cleanly
    if (err.code === 11000) {
      const field =
        Object.keys(err.keyPattern || {})[0] || "field";

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
        message: "Email and password are required.",
      });
    }

    const result =
      await workerService.loginWorker(
        email.trim().toLowerCase(),
        password
      );

    return res.status(200).json({
      status: "success",
      message: "Worker login successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// PROFILE
// COMPLETE WORKER PROFILE
// =====================================================

exports.profile = async (
  req,
  res,
  next
) => {
  try {
    const worker = await Worker.findById(
      req.user.id
    )
      .populate("serviceCategory")
      .select("-passwordHash")
      .lean();

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found.",
      });
    }

    // Always return complete worker document
    return res.status(200).json({
      status: "success",
      data: worker,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// UPDATE PROFILE
// ALL PROFILE DATA SAVED PROPERLY
// =====================================================

exports.updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const worker = await Worker.findById(
      req.user.id
    );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found.",
      });
    }

    const body = req.body || {};

    // =================================================
    // BASIC PROFILE FIELDS
    // =================================================

    if (body.name !== undefined) {
      worker.name = body.name;
    }

    if (body.phone !== undefined) {
      worker.phone = body.phone;
    }

    if (body.email !== undefined) {
      worker.email = String(body.email)
        .trim()
        .toLowerCase();
    }

    if (body.profileImage !== undefined) {
      worker.profileImage = body.profileImage;
    }

    if (body.address !== undefined) {
      worker.address = body.address;
    }

    if (body.city !== undefined) {
      worker.city = body.city;
    }

    if (body.state !== undefined) {
      worker.state = body.state;
    }

    if (body.pincode !== undefined) {
      worker.pincode = body.pincode;
    }

    if (body.experience !== undefined) {
      worker.experience = Number(body.experience);
    }

    // =================================================
    // SERVICE CATEGORY
    // =================================================

    if (body.serviceCategory !== undefined) {
      if (!Array.isArray(body.serviceCategory)) {
        return res.status(400).json({
          status: "error",
          message: "serviceCategory must be an array.",
        });
      }

      worker.serviceCategory =
        body.serviceCategory;
    }

    // Support alternate frontend name: services
    if (
      body.services !== undefined &&
      Array.isArray(body.services)
    ) {
      worker.serviceCategory =
        body.services;
    }

    // =================================================
    // KYC DOCUMENTS
    // =================================================

    if (body.kycDocuments !== undefined) {
      if (
        typeof body.kycDocuments !== "object" ||
        Array.isArray(body.kycDocuments)
      ) {
        return res.status(400).json({
          status: "error",
          message: "kycDocuments must be an object.",
        });
      }

      worker.kycDocuments = {
        ...(worker.kycDocuments || {}),
        ...body.kycDocuments,
      };
    }

    // Direct KYC fields support
    if (
      body.aadhaar !== undefined ||
      body.pan !== undefined ||
      body.certificate !== undefined
    ) {
      worker.kycDocuments = {
        ...(worker.kycDocuments || {}),
        ...(body.aadhaar !== undefined
          ? { aadhaar: body.aadhaar }
          : {}),
        ...(body.pan !== undefined
          ? { pan: body.pan }
          : {}),
        ...(body.certificate !== undefined
          ? { certificate: body.certificate }
          : {}),
      };
    }

    // =================================================
    // AVAILABILITY
    // =================================================

    if (body.availabilityStatus !== undefined) {
      const availability =
        String(body.availabilityStatus)
          .trim()
          .toUpperCase();

      if (!["ON", "OFF"].includes(availability)) {
        return res.status(400).json({
          status: "error",
          message:
            "Availability status must be ON or OFF.",
        });
      }

      worker.availabilityStatus =
        availability;
    }

    // =================================================
    // LOCATION
    // =================================================

    if (
      body.location &&
      Array.isArray(body.location.coordinates) &&
      body.location.coordinates.length === 2
    ) {
      const longitude =
        Number(body.location.coordinates[0]);

      const latitude =
        Number(body.location.coordinates[1]);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid location coordinates.",
        });
      }

      worker.location = {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
        ],
      };
    }

    // =================================================
    // LATITUDE / LONGITUDE DIRECT SUPPORT
    // =================================================

    if (
      body.latitude !== undefined &&
      body.longitude !== undefined
    ) {
      const latitude = Number(
        body.latitude
      );

      const longitude = Number(
        body.longitude
      );

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid latitude or longitude.",
        });
      }

      worker.location = {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
        ],
      };
    }

    // =================================================
    // SAVE EVERYTHING
    // =================================================

    const updatedWorker =
      await worker.save();

    // Return complete updated worker
    const result =
      await Worker.findById(
        updatedWorker._id
      )
        .populate("serviceCategory")
        .select("-passwordHash")
        .lean();

    return res.status(200).json({
      status: "success",
      message: "Worker profile updated successfully.",
      data: result,
    });
  } catch (err) {
    // Handle duplicate email/phone etc.
    if (err.code === 11000) {
      const field =
        Object.keys(err.keyPattern || {})[0] ||
        "field";

      return res.status(409).json({
        status: "error",
        message:
          `Worker with this ${field} already exists.`,
      });
    }

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
    const worker = await Worker.findById(
      req.user.id
    );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found.",
      });
    }

    const body = req.body || {};

    // Accept both:
    // { kycDocuments: {...} }
    // and
    // { aadhaar, pan, certificate }

    let kycData = {};

    if (
      body.kycDocuments &&
      typeof body.kycDocuments === "object" &&
      !Array.isArray(body.kycDocuments)
    ) {
      kycData = {
        ...body.kycDocuments,
      };
    }

    if (body.aadhaar !== undefined) {
      kycData.aadhaar = body.aadhaar;
    }

    if (body.pan !== undefined) {
      kycData.pan = body.pan;
    }

    if (body.certificate !== undefined) {
      kycData.certificate =
        body.certificate;
    }

    if (
      Object.keys(kycData).length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "At least one KYC document is required.",
      });
    }

    worker.kycDocuments = {
      ...(worker.kycDocuments || {}),
      ...kycData,
    };

    await worker.save();

    const updatedWorker =
      await Worker.findById(
        worker._id
      )
        .populate("serviceCategory")
        .select("-passwordHash")
        .lean();

    return res.status(200).json({
      status: "success",
      message: "Worker KYC updated successfully.",
      data: updatedWorker,
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
    const status = String(
      req.body?.status || ""
    )
      .trim()
      .toUpperCase();

    if (!["ON", "OFF"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message:
          "Availability must be ON or OFF.",
      });
    }

    const worker =
      await Worker.findById(
        req.user.id
      );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found.",
      });
    }

    worker.availabilityStatus =
      status;

    await worker.save();

    const updatedWorker =
      await Worker.findById(
        worker._id
      )
        .populate("serviceCategory")
        .select("-passwordHash")
        .lean();

    return res.status(200).json({
      status: "success",
      message:
        `Worker availability updated to ${status}.`,
      data: updatedWorker,
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

    const worker =
      await Worker.findById(
        req.user.id
      );

    if (!worker) {
      return res.status(404).json({
        status: "error",
        message: "Worker profile not found.",
      });
    }

    // Save serviceCategory directly
    // so selected services definitely persist.
    worker.serviceCategory =
      services;

    await worker.save();

    const updatedWorker =
      await Worker.findById(
        worker._id
      )
        .populate("serviceCategory")
        .select("-passwordHash")
        .lean();

    return res.status(200).json({
      status: "success",
      message:
        "Worker services updated successfully.",
      data: updatedWorker,
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

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Latitude and longitude must be valid numbers.",
      });
    }

    if (
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid latitude or longitude range.",
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

    // Save directly as GeoJSON:
    // [longitude, latitude]
    worker.location = {
      type: "Point",
      coordinates: [
        lng,
        lat,
      ],
    };

    await worker.save();

    const updatedWorker =
      await Worker.findById(
        worker._id
      )
        .populate("serviceCategory")
        .select("-passwordHash")
        .lean();

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

// =====================================================
// WORKER JOB STATISTICS
// =====================================================

exports.getJobStats = async (
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

    const stats =
      await workerMatchingService.getWorkerJobStats(
        worker._id
      );

    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// WORKER COMPLETED JOBS
// =====================================================

exports.getCompletedJobs = async (
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

    const jobs =
      await workerMatchingService.getWorkerCompletedJobs(
        worker._id
      );

    return res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

