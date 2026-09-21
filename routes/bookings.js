const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

/**
 * ==========================================
 * BOOKING ROUTES
 * Base URL : /api/bookings
 * ==========================================
 */

/**
 * CREATE NEW BOOKING
 * POST /api/bookings
 */
router.post("/", protect, bookingController.createBooking);

/**
 * GET LOGGED-IN USER BOOKINGS
 * GET /api/bookings
 */
router.get("/", protect, bookingController.listBookings);

/**
 * GET ALL BOOKINGS (ADMIN ONLY)
 * GET /api/bookings/admin/all
 *
 * NOTE:
 * This route MUST be above "/:id"
 * otherwise Express will treat "admin"
 * as the booking id.
 */
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  bookingController.adminAll,
);

/**
 * GET SINGLE BOOKING
 * GET /api/bookings/:id
 */
router.get("/:id", protect, bookingController.getBooking);

/**
 * UPDATE BOOKING STATUS
 * PATCH /api/bookings/:id/status
 */
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  bookingController.updateStatus,
);

module.exports = router;
