const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

/* ===============================
   ADMIN AUTH (Public)
=============================== */
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);

/* ===============================
   DASHBOARD
=============================== */
router.get('/dashboard', protect, authorizeRoles('admin'), adminController.dashboard);

/* ===============================
   USER MANAGEMENT
=============================== */
router.get('/users', protect, authorizeRoles('admin'), adminController.listUsers);
router.patch('/users/:id/status', protect, authorizeRoles('admin'), adminController.updateUserStatus);

/* ===============================
   WORKER MANAGEMENT
=============================== */
router.get('/workers', protect, authorizeRoles('admin'), adminController.listWorkers);
router.patch('/workers/:id/status', protect, authorizeRoles('admin'), adminController.updateWorkerStatus);

/* ===============================
   REQUEST MANAGEMENT
=============================== */
router.get('/requests', protect, authorizeRoles('admin'), adminController.listRequests);
router.patch('/requests/:id/status', protect, authorizeRoles('admin'), adminController.updateRequestStatus);

/* ===============================
   CONTENT MANAGEMENT
=============================== */
router.get('/content', protect, authorizeRoles('admin'), adminController.getContent);
router.put('/content', protect, authorizeRoles('admin'), adminController.updateContent);

/* ===============================
   PRODUCT / CATALOG
=============================== */
router.get('/catalog', protect, authorizeRoles('admin'), adminController.listCatalog);
router.post('/catalog', protect, authorizeRoles('admin'), adminController.createCatalog);
router.put('/catalog/:id', protect, authorizeRoles('admin'), adminController.updateCatalog);

/* ===============================
   BOOKING MONITORING
=============================== */
router.get('/bookings/:bookingId/worker-details', protect, authorizeRoles('admin'), adminController.getBookingWithWorkerDetails);
router.get('/booking-requests', protect, authorizeRoles('admin'), adminController.getAllBookingRequests);

module.exports = router;