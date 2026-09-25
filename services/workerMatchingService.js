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
      });
    })
  );

  return requests.filter((req) => req !== null);
}

async function getWorkerRequests(workerId) {
  return await BookingRequest.find({
    workerId:
      typeof workerId === "string"
        ? new mongoose.Types.ObjectId(workerId)
        : workerId,
    status: { $in: ["PENDING", "SENT"] },
  })
    .populate("bookingId")
    .populate("userId")
    .populate("serviceId")
    .sort({ createdAt: -1 });
}

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

    if (request.status !== "SENT" && request.status !== "PENDING") {
      throw new Error("Request already processed");
    }

    const booking = await Booking.findById(request.bookingId).session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (
      booking.workerId &&
      booking.workerId.toString() !== workerId.toString()
    ) {
      throw new Error("Booking already assigned to another worker");
    }

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

    booking.workerId = workerId;
    booking.bookingStatus = "accepted";

    await booking.save({
      session,
    });

    request.status = "ACCEPTED";
    request.acceptedAt = new Date();

    await request.save({
      session,
    });

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

async function rejectBookingRequest(requestId, workerId) {
  const request = await BookingRequest.findOne({
    _id: requestId,
    workerId,
  });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "SENT" && request.status !== "PENDING") {
    throw new Error("Request already processed");
  }

  request.status = "REJECTED";
  request.rejectedAt = new Date();

  await request.save();

  const booking = await Booking.findById(request.bookingId);

  if (booking && !booking.workerId) {
    const pendingRequests = await BookingRequest.countDocuments({
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
// UPDATE BOOKING STATUS
// =====================================================

async function updateBookingStatus(bookingId, workerId, status) {
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
  // PREVENT DUPLICATE COMPLETION
  // =====================================================

  if (
    normalizedStatus === "completed" &&
    booking.bookingStatus === "completed"
  ) {
    return booking;
  }

  // =====================================================
  // COMPLETED WORK
  // =====================================================

  if (normalizedStatus === "completed") {
    if (
      booking.bookingStatus !== "accepted" &&
      booking.bookingStatus !== "started"
    ) {
      throw new Error(
        "Only accepted or started bookings can be completed."
      );
    }

    booking.bookingStatus = "completed";

    await booking.save();

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
  // CANCELLED BOOKING
  // =====================================================

  if (normalizedStatus === "cancelled") {
    booking.workerId = null;
    booking.bookingStatus = "SEARCHING_WORKER";

    await booking.save();

    try {
      const serviceId =
        booking.serviceDetails?.serviceId ||
        booking.products[0]?.productId;

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

  return await Booking.find({
    workerId: workerObjectId,
    bookingStatus: "completed",
  })
    .populate("userId")
    .populate("products.productId")
    .sort({
      updatedAt: -1,
    })
    .lean();
}

async function getWorkerLocation(workerId) {
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new Error("Worker not found");
  }

  return worker.location;
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
    coordinates: [longitude, latitude],
  };

  await worker.save();

  return worker;
}

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

  // NEW
  getWorkerJobStats,
  getWorkerCompletedJobs,
};
