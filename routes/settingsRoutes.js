const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

// GET  /api/admin/settings
router.get("/", protect, authorizeRoles("admin"), getSettings);

// PUT  /api/admin/settings
router.put("/", protect, authorizeRoles("admin"), updateSettings);

module.exports = router;
