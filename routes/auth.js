const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

/*
==================================================
AUTH ROUTES
Base URL: /api/auth
==================================================
*/

/*
REGISTER CUSTOMER
POST /api/auth/register

Public registration.
Role is ALWAYS customer.
User cannot send role=admin/worker.
*/
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters."),

    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email."),

    body("phone")
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone must be a valid 10-digit number."),

    body("password")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain uppercase, lowercase, number and special character."
      ),
  ],
  authController.register
);

/*
LOGIN
POST /api/auth/login
*/
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required."),

    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  authController.login
);

/*
FORGOT PASSWORD
POST /api/auth/forgot-password
*/
router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required."),
  ],
  authController.forgotPassword
);

/*
RESET PASSWORD
POST /api/auth/reset-password
*/
router.post(
  "/reset-password",
  [
    body("token")
      .notEmpty()
      .withMessage("Reset token is required."),

    body("newPassword")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain uppercase, lowercase, number and special character."
      ),
  ],
  authController.resetPassword
);

/*
REFRESH TOKEN
POST /api/auth/refresh
*/
router.post(
  "/refresh",
  authController.refresh
);

/*
CURRENT USER
GET /api/auth/me
*/
router.get(
  "/me",
  protect,
  authController.getMe
);

/*
UPDATE PROFILE
PUT /api/auth/profile
*/
router.put(
  "/profile",
  protect,
  authController.updateProfile
);

/*
LOGOUT
POST /api/auth/logout
*/
router.post(
  "/logout",
  protect,
  authController.logout
);

module.exports = router;