 // routes/users.js

const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const userController = require("../controllers/userController");
const Request = require("../models/Request");

const router = express.Router();

// ===============================
// USER PROFILE
// ===============================

// GET /api/users/profile
router.get(
  "/profile",
  protect,
  userController.getProfile
);

// PUT /api/users/profile
router.put(
  "/profile",
  protect,
  userController.updateProfile
);


// ===============================
// USER ADDRESSES
// ===============================

// GET /api/users/addresses
router.get(
  "/addresses",
  protect,
  userController.listAddresses
);

// POST /api/users/addresses
router.post(
  "/addresses",
  protect,
  userController.createAddress
);


// ===============================
// USER SUPPORT REQUEST
// ===============================

// POST /api/users/requests
router.post(
  "/requests",
  protect,
  async (req, res, next) => {
    try {
      const request = await Request.create({
        requester: req.user.id,
        type: req.body.type,
        summary: req.body.summary,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        priority: req.body.priority || "Normal",
        status: "pending"
      });

      res.status(201).json({
        status: "success",
        message: "Request submitted successfully.",
        data: request
      });

    } catch (error) {
      next(error);
    }
  }
);


// ===============================
// ADMIN USER MANAGEMENT
// ===============================

// GET /api/users
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  userController.listUsers
);

// PATCH /api/users/:id/status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  userController.changeUserStatus
);


module.exports = router;