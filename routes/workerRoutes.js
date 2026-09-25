const express = require("express");

const router = express.Router();

const workerController = require("../controllers/workerController");

const {
  protect,
} = require("../middleware/auth");

const roleCheck = require("../middleware/roleCheck");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Worker Registration
router.post(
  "/register",
  workerController.register
);

// Worker Login
router.post(
  "/login",
  workerController.login
);

// =====================================================
// PROTECTED WORKER ROUTES
// =====================================================

// Worker Profile
router.get(
  "/profile",
  protect,
  roleCheck("worker"),
  workerController.profile
);

// Update Worker Profile
router.put(
  "/profile",
  protect,
  roleCheck("worker"),
  workerController.updateProfile
);

// Update Worker KYC
router.put(
  "/kyc",
  protect,
  roleCheck("worker"),
  workerController.updateKYC
);

// Worker Availability
router.patch(
  "/availability",
  protect,
  roleCheck("worker"),
  workerController.availability
);

// Get Services
router.get(
  "/services",
  protect,
  roleCheck("worker"),
  workerController.services
);

// Select Services
router.put(
  "/services",
  protect,
  roleCheck("worker"),
  workerController.selectServices
);





// NEW ROUTS ADD HUA AHI OK 


// =====================================================
// WORKER JOB STATISTICS
// GET /api/workers/job-stats
// =====================================================

router.get(
  "/job-stats",
  protect,
  authorizeRoles("worker"),
  workerController.getJobStats
);

// =====================================================
// WORKER COMPLETED JOBS
// GET /api/workers/completed-jobs
// =====================================================

router.get(
  "/completed-jobs",
  protect,
  authorizeRoles("worker"),
  workerController.getCompletedJobs
);
// Get Booking Requests
router.get(
  "/booking-requests",
  protect,
  roleCheck("worker"),
  workerController.getBookingRequests
);

// Accept Booking Request
router.post(
  "/booking-requests/:requestId/accept",
  protect,
  roleCheck("worker"),
  workerController.acceptBookingRequest
);

// Reject Booking Request
router.post(
  "/booking-requests/:requestId/reject",
  protect,
  roleCheck("worker"),
  workerController.rejectBookingRequest
);

// Get Assigned Booking
router.get(
  "/assigned-booking",
  protect,
  roleCheck("worker"),
  workerController.getAssignedBooking
);

// Update Booking Status
router.patch(
  "/bookings/:bookingId/status",
  protect,
  roleCheck("worker"),
  workerController.updateBookingStatus
);

// Update Worker Location
router.patch(
  "/location",
  protect,
  roleCheck("worker"),
  workerController.updateLocation
);

module.exports = router;
