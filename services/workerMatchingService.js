// const mongoose = require("mongoose");
// const Worker = require("../models/Worker");
// const Booking = require("../models/Booking");
// const BookingRequest = require("../models/BookingRequest");
// const Service = require("../models/Service");

// const MAX_DISTANCE_METERS = 5000; // 5 KM

// async function findNearbyWorkers(bookingLocation, serviceId) {
//   if (
//     !bookingLocation ||
//     !bookingLocation.coordinates ||
//     bookingLocation.coordinates.length !== 2
//   ) {
//     throw new Error("Invalid booking location");
//   }

//   const [longitude, latitude] = bookingLocation.coordinates;

//   const nearbyWorkers = await Worker.find({
//     location: {
//       $near: {
//         $geometry: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//         $maxDistance: MAX_DISTANCE_METERS,
//       },
//     },
//     status: "approved",
//     availabilityStatus: "ON",
//     serviceCategory: { $in: [serviceId] }, // ★ FIXED (array support)
//   })
//     .populate("serviceCategory")
//     .lean();

//   return nearbyWorkers.map((worker) => ({
//     ...worker,
//     distance: calculateDistance(
//       latitude,
//       longitude,
//       worker.location.coordinates[1],
//       worker.location.coordinates[0]
//     ),
//   }));
// }

// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371e3; // metres
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c;
// }

// async function sendBookingRequests(bookingId, workers) {
//   const booking = await Booking.findById(bookingId);
//   if (!booking) {
//     throw new Error("Booking not found");
//   }

//   // Prefer serviceDetails.serviceId
//   let serviceId = booking.serviceDetails?.serviceId;

//   // Fallback (only if needed)
//   if (!serviceId && booking.products?.length > 0) {
//     serviceId = booking.products[0].productId;
//   }

//   if (!serviceId) {
//     console.warn(
//       `Booking ${booking.bookingId}: No valid serviceId – cannot create requests`
//     );
//     return [];
//   }

//   const requests = await Promise.all(
//     workers.map(async (worker) => {
//       const existingRequest = await BookingRequest.findOne({
//         bookingId,
//         workerId: worker._id,
//       });

//       if (existingRequest) {
//         return null;
//       }

//       return await BookingRequest.create({
//         bookingId,
//         workerId: worker._id,
//         userId: booking.userId,
//         serviceId,
//         distance: worker.distance,
//         status: "SENT",
//         sentAt: new Date(),
//       });
//     })
//   );

//   return requests.filter((req) => req !== null);
// }

// async function getWorkerRequests(workerId) {
//   return await BookingRequest.find({
//     workerId: typeof workerId === 'string' ? new mongoose.Types.ObjectId(workerId) : workerId,
//     status: { $in: ["PENDING", "SENT"] },
//   })
//     .populate("bookingId")
//     .populate("userId")
//     .populate("serviceId")
//     .sort({ createdAt: -1 });
// }

// async function acceptBookingRequest(requestId, workerId) {
//   const session = await BookingRequest.startSession();
//   session.startTransaction();

//   try {
//     const request = await BookingRequest.findOne({
//       _id: requestId,
//       workerId,
//     }).session(session);

//     if (!request) {
//       throw new Error("Request not found");
//     }

//     if (request.status !== "SENT" && request.status !== "PENDING") {
//       throw new Error("Request already processed");
//     }

//     const booking = await Booking.findById(request.bookingId).session(session);

//     if (!booking) {
//       throw new Error("Booking not found");
//     }

//     if (
//       booking.workerId &&
//       booking.workerId.toString() !== workerId.toString()
//     ) {
//       throw new Error("Booking already assigned to another worker");
//     }

//     if (
//       booking.workerId &&
//       booking.workerId.toString() === workerId.toString()
//     ) {
//       await session.commitTransaction();
//       session.endSession();
//       return { booking, request };
//     }

//     booking.workerId = workerId;
//     booking.bookingStatus = "accepted";
//     await booking.save({ session });

//     request.status = "ACCEPTED";
//     request.acceptedAt = new Date();
//     await request.save({ session });

//     await BookingRequest.updateMany(
//       {
//         bookingId: request.bookingId,
//         workerId: { $ne: workerId },
//         status: { $in: ["PENDING", "SENT"] },
//       },
//       {
//         status: "EXPIRED",
//         expiredAt: new Date(),
//       },
//       { session }
//     );

//     await session.commitTransaction();
//     session.endSession();

//     return { booking, request };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// }

// async function rejectBookingRequest(requestId, workerId) {
//   const request = await BookingRequest.findOne({
//     _id: requestId,
//     workerId,
//   });

//   if (!request) {
//     throw new Error("Request not found");
//   }

//   if (request.status !== "SENT" && request.status !== "PENDING") {
//     throw new Error("Request already processed");
//   }

//   request.status = "REJECTED";
//   request.rejectedAt = new Date();
//   await request.save();

//   const booking = await Booking.findById(request.bookingId);
//   if (booking && !booking.workerId) {
//     const pendingRequests = await BookingRequest.countDocuments({
//       bookingId: request.bookingId,
//       status: { $in: ["PENDING", "SENT"] },
//     });

//     if (pendingRequests === 0) {
//       booking.bookingStatus = "SEARCHING_WORKER";
//       await booking.save();
//       console.log(
//         `Booking ${booking.bookingId}: All workers rejected, status set to SEARCHING_WORKER`
//       );
//     }
//   }

//   return request;
// }

// async function getAssignedBooking(workerId) {
//   const booking = await Booking.findOne({
//     workerId,
//     bookingStatus: { $in: ["accepted", "started"] },
//   })
//     .populate("userId")
//     .populate("products.productId")
//     .lean();

//   if (!booking) {
//     return null;
//   }

//   const user = await require("../models/User").findById(booking.userId).lean();

//   return {
//     ...booking,
//     customer: {
//       name: user?.name || "",
//       phone: user?.phone || "",
//     },
//   };
// }

// async function updateBookingStatus(bookingId, workerId, status) {
//   const booking = await Booking.findOne({
//     _id: bookingId,
//     workerId,
//   });

//   if (!booking) {
//     throw new Error("Booking not found or not assigned to this worker");
//   }

//   const validStatuses = ["accepted", "started", "completed", "cancelled"];
//   if (!validStatuses.includes(status)) {
//     throw new Error("Invalid status");
//   }

//   booking.bookingStatus = status;
//   await booking.save();

//   if (status === "cancelled") {
//     booking.workerId = null;
//     booking.bookingStatus = "SEARCHING_WORKER";
//     await booking.save();

//     try {
//       const serviceId =
//         booking.serviceDetails?.serviceId || booking.products[0]?.productId;

//       if (serviceId && booking.location && booking.location.coordinates) {
//         const nearbyWorkers = await findNearbyWorkers(
//           booking.location,
//           serviceId
//         );

//         if (nearbyWorkers.length > 0) {
//           await sendBookingRequests(booking._id, nearbyWorkers);
//           console.log(
//             `Booking ${booking.bookingId}: Re-sent requests to ${nearbyWorkers.length} nearby workers after cancellation`
//           );
//         }
//       }
//     } catch (error) {
//       console.error(
//         `Error in re-sending worker requests for cancelled booking ${booking.bookingId}:`,
//         error.message
//       );
//     }
//   }

//   return booking;
// }

// async function getWorkerLocation(workerId) {
//   const worker = await Worker.findById(workerId);
//   if (!worker) {
//     throw new Error("Worker not found");
//   }
//   return worker.location;
// }

// async function updateWorkerLocation(workerId, latitude, longitude) {
//   const worker = await Worker.findById(workerId);
//   if (!worker) {
//     throw new Error("Worker not found");
//   }

//   worker.location = {
//     type: "Point",
//     coordinates: [longitude, latitude],
//   };
//   await worker.save();

//   return worker;
// }

// module.exports = {
//   findNearbyWorkers,
//   sendBookingRequests,
//   getWorkerRequests,
//   acceptBookingRequest,
//   rejectBookingRequest,
//   getAssignedBooking,
//   updateBookingStatus,
//   getWorkerLocation,
//   updateWorkerLocation,
// };




const mongoose = require("mongoose");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");
const BookingRequest = require("../models/BookingRequest");
const Service = require("../models/Service");

const MAX_DISTANCE_METERS = 5000; // 5 KM

// =====================================================
// FIND NEARBY WORKERS
// =====================================================

async function findNearbyWorkers(bookingLocation, serviceId) {
  if (
    !bookingLocation ||
    !bookingLocation.coordinates ||
    bookingLocation.coordinates.length !== 2
  ) {
    throw new Error("Invalid booking location");
  }

  const [longitude, latitude] = bookingLocation.coordinates;

  const nearbyWorkers = await Worker.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: MAX_DISTANCE_METERS,
      },
    },
    status: "approved",
    availabilityStatus: "ON",
    serviceCategory: { $in: [serviceId] },
  })
    .populate("serviceCategory")
    .lean();

  return nearbyWorkers.map((worker) => ({
    ...worker,
    distance: calculateDistance(
      latitude,
      longitude,
      worker.location.coordinates[1],
      worker.location.coordinates[0]
    ),
  }));
}

// =====================================================
// DISTANCE CALCULATION
// =====================================================

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// =====================================================
// SEND BOOKING REQUESTS
// =====================================================

async function sendBookingRequests(bookingId, workers) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  let serviceId = booking.serviceDetails?.serviceId;

  if (!serviceId && booking.products?.length > 0) {
    serviceId = booking.products[0].productId;
  }

  if (!serviceId) {
    console.warn(
      `Booking ${booking.bookingId}: No valid serviceId – cannot create requests`
    );

    return [];
  }

  const requests = await Promise.all(
    workers.map(async (worker) => {
      const existingRequest = await BookingRequest.findOne({
        bookingId,
        workerId: worker._id,
      });

      if (existingRequest) {
        return null;
      }

      return await BookingRequest.create({
        bookingId,
        workerId: worker._id,
        userId: booking.userId,
        serviceId,

        distance: worker.distance,

        status: "SENT",
        sentAt: new Date(),

        // Customer details
        customerName: "",
        customerPhone: "",
        customerEmail: "",

        customerAddress: {
          houseNo: booking.address?.houseNo || "",
          landmark: booking.address?.landmark || "",
          city: booking.address?.city || "",
          state: booking.address?.state || "",
          pincode: booking.address?.pincode || "",
          fullAddress: [
            booking.address?.houseNo,
            booking.address?.landmark,
            booking.address?.city,
            booking.address?.state,
            booking.address?.pincode,
          ]
            .filter(Boolean)
            .join(", "),
        },
      });
    })
  );

  return requests.filter((req) => req !== null);
}

// =====================================================
// GET WORKER REQUESTS
// =====================================================

async function getWorkerRequests(workerId) {
  return await BookingRequest.find({
    workerId:
      typeof workerId === "string"
        ? new mongoose.Types.ObjectId(workerId)
        : workerId,

    status: {
      $in: ["PENDING", "SENT"],
    },
  })
    .populate("bookingId")
    .populate("userId")
    .populate("serviceId")
    .sort({
      createdAt: -1,
    });
}

// =====================================================
// ACCEPT BOOKING REQUEST
// =====================================================

async function acceptBookingRequest(requestId, workerId) {
  const session = await BookingRequest.startSession();

  session.startTransaction();

  try {
    const request = await BookingRequest.findOne({
      _id: requestId,
      workerId,
    }).session(session);

    if (!request) {
      throw new Error("Request not found");
    }

    if (
      request.status !== "SENT" &&
      request.status !== "PENDING"
    ) {
      throw new Error("Request already processed");
    }

    const booking = await Booking.findById(
      request.bookingId
    ).session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (
      booking.workerId &&
      booking.workerId.toString() !== workerId.toString()
    ) {
      throw new Error(
        "Booking already assigned to another worker"
      );
    }

    // Already assigned to same worker
    if (
      booking.workerId &&
      booking.workerId.toString() === workerId.toString()
    ) {
      await session.commitTransaction();
      session.endSession();

      return {
        booking,
        request,
      };
    }

    // Assign worker
    booking.workerId = workerId;
    booking.bookingStatus = "accepted";

    await booking.save({
      session,
    });

    // Update request
    request.status = "ACCEPTED";
    request.acceptedAt = new Date();

    await request.save({
      session,
    });

    // Expire other workers' requests
    await BookingRequest.updateMany(
      {
        bookingId: request.bookingId,

        workerId: {
          $ne: workerId,
        },

        status: {
          $in: ["PENDING", "SENT"],
        },
      },
      {
        status: "EXPIRED",
        expiredAt: new Date(),
      },
      {
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      booking,
      request,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
}

// =====================================================
// REJECT BOOKING REQUEST
// =====================================================

async function rejectBookingRequest(requestId, workerId) {
  const request = await BookingRequest.findOne({
    _id: requestId,
    workerId,
  });

  if (!request) {
    throw new Error("Request not found");
  }

  if (
    request.status !== "SENT" &&
    request.status !== "PENDING"
  ) {
    throw new Error("Request already processed");
  }

  request.status = "REJECTED";
  request.rejectedAt = new Date();

  await request.save();

  const booking = await Booking.findById(
    request.bookingId
  );

  if (booking && !booking.workerId) {
    const pendingRequests =
      await BookingRequest.countDocuments({
        bookingId: request.bookingId,

        status: {
          $in: ["PENDING", "SENT"],
        },
      });

    if (pendingRequests === 0) {
      booking.bookingStatus = "SEARCHING_WORKER";

      await booking.save();

      console.log(
        `Booking ${booking.bookingId}: All workers rejected, status set to SEARCHING_WORKER`
      );
    }
  }

  return request;
}

// =====================================================
// GET ASSIGNED BOOKING
// =====================================================

async function getAssignedBooking(workerId) {
  const booking = await Booking.findOne({
    workerId,

    bookingStatus: {
      $in: ["accepted", "started"],
    },
  })
    .populate("userId")
    .populate("products.productId")
    .lean();

  if (!booking) {
    return null;
  }

  const user = await require("../models/User")
    .findById(booking.userId)
    .lean();

  return {
    ...booking,

    customer: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  };
}

// =====================================================
// UPDATE WORKER COUNTERS
//
// IMPORTANT:
// totalJobs = all bookings assigned to worker
// completedJobs = all completed bookings of worker
//
// Atomic update is used so duplicate requests do not
// accidentally increment counters multiple times.
// =====================================================

async function syncWorkerJobCounters(workerId) {
  const workerObjectId =
    typeof workerId === "string"
      ? new mongoose.Types.ObjectId(workerId)
      : workerId;

  if (!workerObjectId) {
    throw new Error("Worker ID is required");
  }

  const [totalJobs, completedJobs] =
    await Promise.all([
      Booking.countDocuments({
        workerId: workerObjectId,
      }),

      Booking.countDocuments({
        workerId: workerObjectId,
        bookingStatus: "completed",
      }),
    ]);

  const worker = await Worker.findByIdAndUpdate(
    workerObjectId,
    {
      $set: {
        totalJobs: totalJobs,
        completedJobs: completedJobs,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!worker) {
    throw new Error("Worker not found");
  }

  console.log(
    `WORKER COUNTERS UPDATED | worker=${workerObjectId} | totalJobs=${totalJobs} | completedJobs=${completedJobs}`
  );

  return worker;
}

// =====================================================
// UPDATE BOOKING STATUS
// =====================================================

async function updateBookingStatus(
  bookingId,
  workerId,
  status
) {
  const booking = await Booking.findOne({
    _id: bookingId,
    workerId,
  });

  if (!booking) {
    throw new Error(
      "Booking not found or not assigned to this worker"
    );
  }

  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  const validStatuses = [
    "accepted",
    "started",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error("Invalid status");
  }

  // =====================================================
  // PREVIOUS STATUS
  // =====================================================

  const previousStatus = booking.bookingStatus;

  // =====================================================
  // PREVENT DUPLICATE COMPLETION
  // =====================================================

  if (
    normalizedStatus === "completed" &&
    previousStatus === "completed"
  ) {
    // Even if old data counters are wrong,
    // synchronize them safely.
    await syncWorkerJobCounters(workerId);

    return booking;
  }

  // =====================================================
  // COMPLETED WORK
  // =====================================================

  if (normalizedStatus === "completed") {
    if (
      previousStatus !== "accepted" &&
      previousStatus !== "started"
    ) {
      throw new Error(
        "Only accepted or started bookings can be completed."
      );
    }

    // Change booking status
    booking.bookingStatus = "completed";

    await booking.save();

    // ===================================================
    // IMPORTANT:
    // Save completedJobs + totalJobs in Worker DB
    // ===================================================

    await syncWorkerJobCounters(workerId);

    console.log(
      `Booking ${booking.bookingId}: WORK COMPLETED by worker ${workerId}`
    );

    return booking;
  }

  // =====================================================
  // NORMAL STATUS UPDATE
  // =====================================================

  booking.bookingStatus = normalizedStatus;

  await booking.save();

  // =====================================================
  // SYNC COUNTERS AFTER NORMAL STATUS
  // =====================================================

  await syncWorkerJobCounters(workerId);

  // =====================================================
  // CANCELLED BOOKING
  // =====================================================

  if (normalizedStatus === "cancelled") {
    booking.workerId = null;
    booking.bookingStatus = "SEARCHING_WORKER";

    await booking.save();

    // Worker counters must be recalculated because
    // cancelled booking is no longer assigned to worker.
    await syncWorkerJobCounters(workerId);

    try {
      const serviceId =
        booking.serviceDetails?.serviceId ||
        booking.products?.[0]?.productId;

      if (
        serviceId &&
        booking.location &&
        booking.location.coordinates
      ) {
        const nearbyWorkers = await findNearbyWorkers(
          booking.location,
          serviceId
        );

        if (nearbyWorkers.length > 0) {
          await sendBookingRequests(
            booking._id,
            nearbyWorkers
          );

          console.log(
            `Booking ${booking.bookingId}: Re-sent requests to ${nearbyWorkers.length} nearby workers after cancellation`
          );
        }
      }
    } catch (error) {
      console.error(
        `Error in re-sending worker requests for cancelled booking ${booking.bookingId}:`,
        error.message
      );
    }
  }

  return booking;
}

// =====================================================
// GET WORKER JOB STATISTICS
// =====================================================

async function getWorkerJobStats(workerId) {
  const workerObjectId =
    typeof workerId === "string"
      ? new mongoose.Types.ObjectId(workerId)
      : workerId;

  const [
    totalJobs,
    completedJobs,
    activeJobs,
    paidCompletedJobs,
    pendingPaymentJobs,
  ] = await Promise.all([
    Booking.countDocuments({
      workerId: workerObjectId,
    }),

    Booking.countDocuments({
      workerId: workerObjectId,
      bookingStatus: "completed",
    }),

    Booking.countDocuments({
      workerId: workerObjectId,

      bookingStatus: {
        $in: ["accepted", "started"],
      },
    }),

    Booking.countDocuments({
      workerId: workerObjectId,
      bookingStatus: "completed",
      paymentStatus: "paid",
    }),

    Booking.countDocuments({
      workerId: workerObjectId,
      bookingStatus: "completed",
      paymentStatus: "pending",
    }),
  ]);

  // =====================================================
  // IMPORTANT:
  // Also keep Worker document synchronized.
  // =====================================================

  await Worker.findByIdAndUpdate(
    workerObjectId,
    {
      $set: {
        totalJobs,
        completedJobs,
      },
    },
    {
      new: false,
    }
  );

  return {
    totalJobs,
    completedJobs,
    activeJobs,
    paidCompletedJobs,
    pendingPaymentJobs,
  };
}

// =====================================================
// GET ALL WORKER COMPLETED JOBS
// =====================================================

async function getWorkerCompletedJobs(workerId) {
  const workerObjectId =
    typeof workerId === "string"
      ? new mongoose.Types.ObjectId(workerId)
      : workerId;

  const jobs = await Booking.find({
    workerId: workerObjectId,
    bookingStatus: "completed",
  })
    .populate("userId")
    .populate("products.productId")
    .sort({
      updatedAt: -1,
    })
    .lean();

  return jobs;
}

// =====================================================
// SYNC ALL WORKER JOB COUNTERS
//
// This is useful for old/existing workers whose
// Worker.totalJobs / completedJobs are still 0.
// =====================================================

async function syncAllWorkerJobCounters() {
  const workers = await Worker.find({
    role: "worker",
  }).select("_id");

  let updated = 0;

  for (const worker of workers) {
    await syncWorkerJobCounters(worker._id);
    updated++;
  }

  console.log(
    `ALL WORKER COUNTERS SYNCHRONIZED: ${updated}`
  );

  return {
    updatedWorkers: updated,
  };
}

// =====================================================
// GET WORKER LOCATION
// =====================================================

async function getWorkerLocation(workerId) {
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new Error("Worker not found");
  }

  return worker.location;
}

// =====================================================
// UPDATE WORKER LOCATION
// =====================================================

// =====================================================
// GET WORKER REQUEST HISTORY (Accepted Requests)
// =====================================================
async function getWorkerRequestHistory(workerId) {
  const workerObjectId =
    typeof workerId === "string"
      ? new mongoose.Types.ObjectId(workerId)
      : workerId;

  const history = await Booking.find({
    workerId: workerObjectId,
    bookingStatus: { $in: ["accepted", "started", "completed"] },
  })
    .populate("userId", "name phone email")
    .sort({ updatedAt: -1 })
    .lean();

  // Clean response for frontend
  return history.map((item) => {
    const user = item.userId || {};
    const address = item.address || {};

    return {
      _id: item._id,
      customerName: user.name || item.customerName || "Customer",
      customerPhone: user.phone || item.customerPhone || "N/A",
      customerEmail: user.email || item.customerEmail || "N/A",
      fullAddress:
        address.fullAddress ||
        [
          address.houseNo,
          address.landmark,
          address.city,
          address.state,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
        "N/A",
      serviceName:
        item.serviceDetails?.serviceName ||
        item.serviceName ||
        "Service",
      totalAmount: item.totalAmount || 0,
      acceptedAt: item.updatedAt || item.createdAt,
      bookingStatus: item.bookingStatus,
    };
  });
}



async function updateWorkerLocation(
  workerId,
  latitude,
  longitude
) {
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new Error("Worker not found");
  }

  worker.location = {
    type: "Point",
    coordinates: [
      Number(longitude),
      Number(latitude),
    ],
  };

  await worker.save();

  return worker;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  findNearbyWorkers,
  sendBookingRequests,
  getWorkerRequests,
  acceptBookingRequest,
  rejectBookingRequest,
  getAssignedBooking,
  updateBookingStatus,
  getWorkerLocation,
  updateWorkerLocation,

  // JOB STATISTICS
  getWorkerJobStats,
  getWorkerCompletedJobs,

  // COUNTER SYNC
  syncWorkerJobCounters,
  syncAllWorkerJobCounters,
};
