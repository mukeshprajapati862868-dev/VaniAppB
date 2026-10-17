// const express = require("express");
// const router = express.Router();

// const serviceController = require("../controllers/serviceController");
// const { protect, authorizeRoles } = require("../middleware/auth");

// // =====================================================
// // PUBLIC ROUTES
// // =====================================================

// // Get all services (optional ?category=Man)
// router.get("/", serviceController.getAllServices);

// // Get services grouped by category
// router.get("/grouped", serviceController.getServicesByCategory);

// // Get single service
// router.get("/:id", serviceController.getServiceById);

// // =====================================================
// // ADMIN ONLY ROUTES
// // =====================================================

// // Create service
// router.post(
//   "/",
//   protect,
//   authorizeRoles("admin"),
//   serviceController.createService
// );

// // Update service
// router.put(
//   "/:id",
//   protect,
//   authorizeRoles("admin"),
//   serviceController.updateService
// );

// // Delete service
// router.delete(
//   "/:id",
//   protect,
//   authorizeRoles("admin"),
//   serviceController.deleteService
// );

// module.exports = router;





const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { protect, authorizeRoles } = require("../middleware/auth");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all services (optional ?category=Man)
router.get("/", serviceController.getAllServices);

// Get services grouped by category
router.get("/grouped", serviceController.getServicesByCategory);

// ★★★ YEH NAYA ROUTE ADD KARO (/:id se PEHLE) ★★★
router.get("/categories", serviceController.getServicesByCategory);

// Get single service
router.get("/:id", serviceController.getServiceById);

// =====================================================
// ADMIN ONLY ROUTES
// =====================================================

// Create service
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  serviceController.createService
);

// Update service
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  serviceController.updateService
);

// Delete service
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  serviceController.deleteService
);

module.exports = router;
