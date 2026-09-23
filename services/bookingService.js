// const Booking = require("../models/Booking");
// const Address = require("../models/Address");
// const workerMatchingService = require("./workerMatchingService");
// const Service = require("../models/Service");

// const generateBookingId = () => {
//   return "BK-" + Date.now();
// };

// const generateOrderId = () => {
//   return "ORD-" + Date.now();
// };

// async function createBooking(payload) {
//   let addressId = null;

//   if (payload.address) {
//     const address = await Address.create({
//       userId: payload.userId,

//       houseNo: payload.address.houseNo || "",

//       landmark: payload.address.landmark || "",

//       city: payload.address.city || "",

//       state: payload.address.state || "",

//       pincode: payload.address.pincode || "",
//     });

//     addressId = address._id;
//   }

//   const booking = await Booking.create({
//     userId: payload.userId,

//     bookingId: generateBookingId(),

//     orderId: generateOrderId(),

//     products: payload.products || [],

//     address: payload.address,

//     addressId: addressId,

//     bookingDate: payload.bookingDate,

//     bookingTime: payload.bookingTime,

//     paymentMethod: payload.paymentMethod || "COD",

//     paymentStatus: "pending",

//     bookingStatus: "pending",

//     totalAmount: payload.totalAmount || 0,

//     location: payload.location || {
//       type: "Point",
//       coordinates: [0, 0],
//     },

//     serviceDetails: payload.serviceDetails || {},
//   });

//   if (payload.location && payload.location.coordinates && payload.location.coordinates.length === 2) {
//     try {
//       let serviceId = payload.serviceDetails?.serviceId || null;
//       if (serviceId && !require("mongoose").isValidObjectId(serviceId)) {
//         const service = await Service.findOne({
//           name: { $regex: `^${payload.serviceDetails?.serviceName || serviceId}$`, $options: "i" },
//           status: "active",
//         }).select("_id");
//         serviceId = service?._id || null;
//       }

//       if (serviceId) {
//         console.log(`Starting worker search for booking ${booking.bookingId} with serviceId: ${serviceId}`);
//         const nearbyWorkers = await workerMatchingService.findNearbyWorkers(
//           payload.location,
//           serviceId
//         );

//         console.log(`Found ${nearbyWorkers.length} nearby workers for booking ${booking.bookingId}`);

//         if (nearbyWorkers.length > 0) {
//           await workerMatchingService.sendBookingRequests(booking._id, nearbyWorkers);
//           console.log(`Booking ${booking.bookingId}: Sent requests to ${nearbyWorkers.length} nearby workers`);
//         } else {
//           console.log(`Booking ${booking.bookingId}: No nearby workers found within 5 KM`);
//           booking.bookingStatus = "SEARCHING_WORKER";
//           await booking.save();
//         }
//       } else {
//         console.log(`Booking ${booking.bookingId}: No serviceId found in products, skipping worker matching`);
//       }
//     } catch (error) {
//       console.error(`Error in worker matching for booking ${booking.bookingId}:`, error.message);
//       console.error(`Error stack:`, error.stack);
//       // Don't fail the booking creation if worker matching fails
//       booking.bookingStatus = "SEARCHING_WORKER";
//       await booking.save();
//     }
//   } else {
//     console.log(`Booking ${booking.bookingId}: No valid location provided, skipping worker matching`);
//   }

//   return booking;
// }

// async function getBookingsByUser(userId) {
//   return await Booking.find({
//     userId,
//   })
//     .populate("products.productId")
//     .sort({
//       createdAt: -1,
//     });
// }

// async function getBooking(id) {
//   return await Booking.findById(id).populate("products.productId");
// }

// async function changeBookingStatus(id, status) {
//   return await Booking.findByIdAndUpdate(
//     id,

//     {
//       bookingStatus: status,
//     },

//     {
//       new: true,
//     },
//   );
// }

// async function listAllBookings() {
//   return await Booking.find()
//     .populate("userId")
//     .populate("products.productId")
//     .sort({
//       createdAt: -1,
//     });
// }

// module.exports = {
//   createBooking,

//   getBookingsByUser,

//   getBooking,

//   changeBookingStatus,

//   listAllBookings,
// };

const Booking = require("../models/Booking");
const Address = require("../models/Address");
const workerMatchingService = require("./workerMatchingService");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const generateBookingId = () => {
  return "BK-" + Date.now();
};

const generateOrderId = () => {
  return "ORD-" + Date.now();
};

async function createBooking(payload) {
  let addressId = null;

  if (payload.address) {
    const address = await Address.create({
      userId: payload.userId,
      houseNo: payload.address.houseNo || "",
      landmark: payload.address.landmark || "",
      city: payload.address.city || "",
      state: payload.address.state || "",
      pincode: payload.address.pincode || "",
    });
    addressId = address._id;
  }

  const booking = await Booking.create({
    userId: payload.userId,
    bookingId: generateBookingId(),
    orderId: generateOrderId(),
    products: payload.products || [],
    address: payload.address,
    addressId: addressId,
    bookingDate: payload.bookingDate,
    bookingTime: payload.bookingTime,
    paymentMethod: payload.paymentMethod || "COD",
    paymentStatus: "pending",
    bookingStatus: "pending",
    totalAmount: payload.totalAmount || 0,
    location: payload.location || {
      type: "Point",
      coordinates: [0, 0],
    },
    serviceDetails: payload.serviceDetails || {},
  });

  // ===== Worker Matching =====
  if (
    payload.location &&
    Array.isArray(payload.location.coordinates) &&
    payload.location.coordinates.length === 2 &&
    Number.isFinite(payload.location.coordinates[0]) &&
    Number.isFinite(payload.location.coordinates[1])
  ) {
    try {
      let serviceId = payload.serviceDetails?.serviceId || null;

      // Agar serviceId valid ObjectId nahi hai to name se search karo
      if (serviceId && !mongoose.isValidObjectId(serviceId)) {
        const service = await Service.findOne({
          name: {
            $regex: `^${payload.serviceDetails?.serviceName || serviceId}$`,
            $options: "i",
          },
          status: "active",
        }).select("_id");
        serviceId = service?._id || null;
      }

      // Last fallback
      if (!serviceId && payload.products?.length > 0) {
        serviceId = payload.products[0].productId;
      }

      if (serviceId) {
        console.log(
          `Starting worker search for booking ${booking.bookingId} with serviceId: ${serviceId}`
        );

        const nearbyWorkers = await workerMatchingService.findNearbyWorkers(
          payload.location,
          serviceId
        );

        console.log(
          `Found ${nearbyWorkers.length} nearby workers for booking ${booking.bookingId}`
        );

        if (nearbyWorkers.length > 0) {
          await workerMatchingService.sendBookingRequests(
            booking._id,
            nearbyWorkers
          );
          console.log(
            `Booking ${booking.bookingId}: Sent requests to ${nearbyWorkers.length} nearby workers`
          );
        } else {
          console.log(
            `Booking ${booking.bookingId}: No nearby workers found within 5 KM`
          );
          booking.bookingStatus = "SEARCHING_WORKER";
          await booking.save();
        }
      } else {
        console.log(
          `Booking ${booking.bookingId}: No serviceId found, skipping worker matching`
        );
      }
    } catch (error) {
      console.error(
        `Error in worker matching for booking ${booking.bookingId}:`,
        error.message
      );
      console.error(`Error stack:`, error.stack);

      booking.bookingStatus = "SEARCHING_WORKER";
      await booking.save();
    }
  } else {
    console.log(
      `Booking ${booking.bookingId}: No valid location provided, skipping worker matching`
    );
  }

  return booking;
}

async function getBookingsByUser(userId) {
  return await Booking.find({ userId })
    .populate("products.productId")
    .populate("workerId")
    .sort({ createdAt: -1 });
}

async function getBooking(id) {
  return await Booking.findById(id).populate("products.productId");
}

async function changeBookingStatus(id, status) {
  return await Booking.findByIdAndUpdate(
    id,
    { bookingStatus: status },
    { new: true }
  );
}

async function listAllBookings() {
  return await Booking.find()
    .populate("userId")
    .populate("products.productId")
    .sort({ createdAt: -1 });
}

module.exports = {
  createBooking,
  getBookingsByUser,
  getBooking,
  changeBookingStatus,
  listAllBookings,
};
