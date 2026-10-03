// // const User = require("../models/User");
// // const jwt = require("jsonwebtoken");
// // const bcrypt = require("bcryptjs");
// // const { nanoid } = require("nanoid");
// // const crypto = require("crypto");

// // // =====================================================
// // // GENERATE JWT TOKEN
// // // =====================================================

// // function signToken(user) {
// //   const secret = process.env.JWT_SECRET;

// //   if (!secret) {
// //     throw new Error("JWT_SECRET is not configured");
// //   }

// //   return jwt.sign(
// //     {
// //       id: user._id.toString(),
// //       role: user.role,
// //     },
// //     secret,
// //     {
// //       expiresIn:
// //         process.env.JWT_EXPIRES_IN || "7d",
// //     }
// //   );
// // }

// // // =====================================================
// // // SANITIZE USER
// // // =====================================================

// // function sanitizeUser(user) {
// //   if (!user) {
// //     return null;
// //   }

// //   const obj = user.toObject
// //     ? user.toObject()
// //     : { ...user };

// //   if (obj._id) {
// //     obj.id = obj._id.toString();
// //     delete obj._id;
// //   }

// //   delete obj.password;
// //   delete obj.passwordHash;
// //   delete obj.refreshTokens;
// //   delete obj.passwordResetToken;
// //   delete obj.passwordResetExpires;

// //   return obj;
// // }

// // // =====================================================
// // // REGISTER NORMAL USER
// // // CUSTOMER / ADMIN
// // // =====================================================

// // async function registerUser(payload) {
// //   const {
// //     name,
// //     email,
// //     phone,
// //     password,
// //     role,
// //     adminKey,
// //   } = payload;

// //   if (!name || !name.trim()) {
// //     throw {
// //       statusCode: 400,
// //       message: "Name is required.",
// //     };
// //   }

// //   if (!email || !email.trim()) {
// //     throw {
// //       statusCode: 400,
// //       message: "Email is required.",
// //     };
// //   }

// //   if (!phone || !phone.trim()) {
// //     throw {
// //       statusCode: 400,
// //       message: "Phone number is required.",
// //     };
// //   }

// //   if (!password) {
// //     throw {
// //       statusCode: 400,
// //       message: "Password is required.",
// //     };
// //   }

// //   const normalizedEmail =
// //     email.trim().toLowerCase();

// //   const existing = await User.findOne({
// //     email: normalizedEmail,
// //   });

// //   if (existing) {
// //     throw {
// //       statusCode: 409,
// //       message: "User already exists.",
// //     };
// //   }

// //   let finalRole = "customer";

// //   // ===================================================
// //   // CUSTOMER
// //   // ===================================================

// //   if (!role || role === "customer") {
// //     finalRole = "customer";
// //   }

// //   // ===================================================
// //   // ADMIN
// //   // ===================================================

// //   else if (role === "admin") {
// //     if (
// //       !process.env.ADMIN_REGISTRATION_KEY ||
// //       adminKey !==
// //         process.env.ADMIN_REGISTRATION_KEY
// //     ) {
// //       throw {
// //         statusCode: 403,
// //         message:
// //           "Invalid admin registration key.",
// //       };
// //     }

// //     finalRole = "admin";
// //   }

// //   // ===================================================
// //   // WORKER
// //   // ===================================================

// //   else if (role === "worker") {
// //     throw {
// //       statusCode: 403,
// //       message:
// //         "Worker registration must use the worker registration API.",
// //     };
// //   }

// //   else {
// //     throw {
// //       statusCode: 400,
// //       message: "Invalid role.",
// //     };
// //   }

// //   const salt = await bcrypt.genSalt(
// //     Number(process.env.BCRYPT_ROUNDS) || 12
// //   );

// //   const passwordHash =
// //     await bcrypt.hash(password, salt);

// //   const user = await User.create({
// //     name: name.trim(),
// //     email: normalizedEmail,
// //     phone: phone.trim(),
// //     passwordHash,
// //     role: finalRole,
// //     status: "active",
// //   });

// //   // ===================================================
// //   // ACCESS TOKEN
// //   // ===================================================

// //   const token = signToken(user);

// //   // ===================================================
// //   // REFRESH TOKEN
// //   // ===================================================

// //   const refreshToken = nanoid(64);

// //   if (!Array.isArray(user.refreshTokens)) {
// //     user.refreshTokens = [];
// //   }

// //   user.refreshTokens.push({
// //     tokenHash: refreshToken,
// //     createdAt: new Date(),
// //   });

// //   await user.save();

// //   return {
// //     user: sanitizeUser(user),
// //     token,
// //     refreshToken,
// //   };
// // }

// // // =====================================================
// // // LOGIN NORMAL USER
// // // =====================================================

// // async function loginUser(email, password) {
// //   if (!email || !password) {
// //     throw {
// //       statusCode: 400,
// //       message:
// //         "Email and password are required.",
// //     };
// //   }

// //   const normalizedEmail =
// //     email.trim().toLowerCase();

// //   const user = await User.findOne({
// //     email: normalizedEmail,
// //   });

// //   if (!user) {
// //     throw {
// //       statusCode: 401,
// //       message: "Invalid credentials.",
// //     };
// //   }

// //   // Worker credentials belong to the Worker collection and must use the
// //   // dedicated worker login endpoint.
// //   if (user.role === "worker") {
// //     throw {
// //       statusCode: 403,
// //       message: "Please sign in through the worker login.",
// //     };
// //   }

// //   if (user.status !== "active") {
// //     throw {
// //       statusCode: 403,
// //       message: "Your account is blocked.",
// //     };
// //   }

// //   const isMatch =
// //     await bcrypt.compare(
// //       password,
// //       user.passwordHash
// //     );

// //   if (!isMatch) {
// //     throw {
// //       statusCode: 401,
// //       message: "Invalid credentials.",
// //     };
// //   }

// //   const token = signToken(user);

// //   const refreshToken = nanoid(64);

// //   if (!Array.isArray(user.refreshTokens)) {
// //     user.refreshTokens = [];
// //   }

// //   user.refreshTokens.push({
// //     tokenHash: refreshToken,
// //     createdAt: new Date(),
// //   });

// //   await user.save();

// //   return {
// //     user: sanitizeUser(user),
// //     token,
// //     refreshToken,
// //   };
// // }

// // // =====================================================
// // // REFRESH AUTH
// // // =====================================================

// // async function refreshAuth(refreshToken) {
// //   if (!refreshToken) {
// //     throw {
// //       statusCode: 400,
// //       message:
// //         "Refresh token is required.",
// //     };
// //   }

// //   const user = await User.findOne({
// //     "refreshTokens.tokenHash":
// //       refreshToken,
// //   });

// //   if (!user) {
// //     throw {
// //       statusCode: 401,
// //       message:
// //         "Invalid refresh token.",
// //     };
// //   }

// //   if (user.status !== "active") {
// //     throw {
// //       statusCode: 403,
// //       message:
// //         "Your account is blocked.",
// //     };
// //   }

// //   const token = signToken(user);

// //   return {
// //     user: sanitizeUser(user),
// //     token,
// //   };
// // }

// // // =====================================================
// // // LOGOUT
// // // =====================================================

// // async function logout(
// //   userId,
// //   refreshToken
// // ) {
// //   if (refreshToken) {
// //     await User.findByIdAndUpdate(
// //       userId,
// //       {
// //         $pull: {
// //           refreshTokens: {
// //             tokenHash: refreshToken,
// //           },
// //         },
// //       }
// //     );
// //   } else {
// //     await User.findByIdAndUpdate(
// //       userId,
// //       {
// //         $set: {
// //           refreshTokens: [],
// //         },
// //       }
// //     );
// //   }

// //   return true;
// // }

// // // =====================================================
// // // SEND PASSWORD RESET
// // // =====================================================

// // async function sendPasswordReset(email) {
// //   if (!email) {
// //     throw {
// //       statusCode: 400,
// //       message: "Email is required.",
// //     };
// //   }

// //   const normalizedEmail =
// //     email.trim().toLowerCase();

// //   const user = await User.findOne({
// //     email: normalizedEmail,
// //   });

// //   if (!user) {
// //     return null;
// //   }

// //   const resetToken =
// //     crypto
// //       .randomBytes(32)
// //       .toString("hex");

// //   const hashedToken =
// //     crypto
// //       .createHash("sha256")
// //       .update(resetToken)
// //       .digest("hex");

// //   user.passwordResetToken =
// //     hashedToken;

// //   user.passwordResetExpires =
// //     Date.now() + 60 * 60 * 1000;

// //   await user.save();

// //   return resetToken;
// // }

// // // =====================================================
// // // RESET PASSWORD
// // // =====================================================

// // async function resetPassword(
// //   token,
// //   newPassword
// // ) {
// //   if (!token || !newPassword) {
// //     throw {
// //       statusCode: 400,
// //       message:
// //         "Reset token and new password are required.",
// //     };
// //   }

// //   const hashedToken =
// //     crypto
// //       .createHash("sha256")
// //       .update(token)
// //       .digest("hex");

// //   const user = await User.findOne({
// //     passwordResetToken:
// //       hashedToken,

// //     passwordResetExpires: {
// //       $gt: Date.now(),
// //     },
// //   });

// //   if (!user) {
// //     throw {
// //       statusCode: 400,
// //       message:
// //         "Invalid or expired password reset token.",
// //     };
// //   }

// //   const salt = await bcrypt.genSalt(
// //     Number(process.env.BCRYPT_ROUNDS) || 12
// //   );

// //   user.passwordHash =
// //     await bcrypt.hash(
// //       newPassword,
// //       salt
// //     );

// //   user.passwordResetToken =
// //     undefined;

// //   user.passwordResetExpires =
// //     undefined;

// //   user.refreshTokens = [];

// //   await user.save();

// //   return sanitizeUser(user);
// // }

// // // =====================================================
// // // GET PROFILE
// // // =====================================================

// // async function getProfile(userId) {
// //   const user =
// //     await User.findById(userId);

// //   if (!user) {
// //     throw {
// //       statusCode: 404,
// //       message: "User not found.",
// //     };
// //   }

// //   return sanitizeUser(user);
// // }

// // // =====================================================
// // // UPDATE USER PROFILE
// // // =====================================================

// // async function updateUserProfile(
// //   userId,
// //   payload
// // ) {
// //   const allowedFields = [
// //     "name",
// //     "phone",
// //     "addresses",
// //   ];

// //   const updateData = {};

// //   for (const field of allowedFields) {
// //     if (
// //       Object.prototype.hasOwnProperty.call(
// //         payload,
// //         field
// //       )
// //     ) {
// //       updateData[field] =
// //         payload[field];
// //     }
// //   }

// //   // ===================================================
// //   // PASSWORD UPDATE
// //   // ===================================================

// //   if (payload.password) {
// //     const salt = await bcrypt.genSalt(
// //       Number(process.env.BCRYPT_ROUNDS) || 12
// //     );

// //     updateData.passwordHash =
// //       await bcrypt.hash(
// //         payload.password,
// //         salt
// //       );

// //     updateData.refreshTokens = [];
// //   }

// //   const updatedUser =
// //     await User.findByIdAndUpdate(
// //       userId,
// //       {
// //         $set: updateData,
// //       },
// //       {
// //         new: true,
// //         runValidators: true,
// //       }
// //     );

// //   if (!updatedUser) {
// //     throw {
// //       statusCode: 404,
// //       message: "User not found.",
// //     };
// //   }

// //   return sanitizeUser(updatedUser);
// // }

// // // =====================================================
// // // EXPORTS
// // // =====================================================

// // module.exports = {
// //   registerUser,
// //   loginUser,
// //   refreshAuth,
// //   logout,
// //   sendPasswordReset,
// //   resetPassword,
// //   getProfile,
// //   updateUserProfile,
// // };

// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { nanoid } = require("nanoid");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");

// // =====================================================
// // GENERATE JWT TOKEN
// // =====================================================

// function signToken(user) {
//   const secret = process.env.JWT_SECRET;

//   if (!secret) {
//     throw new Error("JWT_SECRET is not configured");
//   }

//   return jwt.sign(
//     {
//       id: user._id.toString(),
//       role: user.role,
//     },
//     secret,
//     {
//       expiresIn:
//         process.env.JWT_EXPIRES_IN || "7d",
//     }
//   );
// }

// // =====================================================
// // SANITIZE USER
// // =====================================================

// function sanitizeUser(user) {
//   if (!user) {
//     return null;
//   }

//   const obj = user.toObject
//     ? user.toObject()
//     : { ...user };

//   if (obj._id) {
//     obj.id = obj._id.toString();
//     delete obj._id;
//   }

//   delete obj.password;
//   delete obj.passwordHash;
//   delete obj.refreshTokens;
//   delete obj.passwordResetToken;
//   delete obj.passwordResetExpires;

//   return obj;
// }

// // =====================================================
// // REGISTER NORMAL USER
// // CUSTOMER / ADMIN
// // =====================================================

// async function registerUser(payload) {
//   const {
//     name,
//     email,
//     phone,
//     password,
//     role,
//     adminKey,
//   } = payload;

//   if (!name || !name.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Name is required.",
//     };
//   }

//   if (!email || !email.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Email is required.",
//     };
//   }

//   if (!phone || !phone.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Phone number is required.",
//     };
//   }

//   if (!password) {
//     throw {
//       statusCode: 400,
//       message: "Password is required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   const existing = await User.findOne({
//     email: normalizedEmail,
//   });

//   if (existing) {
//     throw {
//       statusCode: 409,
//       message: "User already exists.",
//     };
//   }

//   let finalRole = "customer";

//   // ===================================================
//   // CUSTOMER
//   // ===================================================

//   if (!role || role === "customer") {
//     finalRole = "customer";
//   }

//   // ===================================================
//   // ADMIN
//   // ===================================================

//   else if (role === "admin") {
//     if (
//       !process.env.ADMIN_REGISTRATION_KEY ||
//       adminKey !==
//         process.env.ADMIN_REGISTRATION_KEY
//     ) {
//       throw {
//         statusCode: 403,
//         message:
//           "Invalid admin registration key.",
//       };
//     }

//     finalRole = "admin";
//   }

//   // ===================================================
//   // WORKER
//   // ===================================================

//   else if (role === "worker") {
//     throw {
//       statusCode: 403,
//       message:
//         "Worker registration must use the worker registration API.",
//     };
//   }

//   else {
//     throw {
//       statusCode: 400,
//       message: "Invalid role.",
//     };
//   }

//   const salt = await bcrypt.genSalt(
//     Number(process.env.BCRYPT_ROUNDS) || 12
//   );

//   const passwordHash =
//     await bcrypt.hash(password, salt);

//   const user = await User.create({
//     name: name.trim(),
//     email: normalizedEmail,
//     phone: phone.trim(),
//     passwordHash,
//     role: finalRole,
//     status: "active",
//   });

//   // ===================================================
//   // ACCESS TOKEN
//   // ===================================================

//   const token = signToken(user);

//   // ===================================================
//   // REFRESH TOKEN
//   // ===================================================

//   const refreshToken = nanoid(64);

//   if (!Array.isArray(user.refreshTokens)) {
//     user.refreshTokens = [];
//   }

//   user.refreshTokens.push({
//     tokenHash: refreshToken,
//     createdAt: new Date(),
//   });

//   await user.save();

//   return {
//     user: sanitizeUser(user),
//     token,
//     refreshToken,
//   };
// }

// // =====================================================
// // LOGIN NORMAL USER
// // =====================================================

// async function loginUser(email, password) {
//   if (!email || !password) {
//     throw {
//       statusCode: 400,
//       message:
//         "Email and password are required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   const user = await User.findOne({
//     email: normalizedEmail,
//   });

//   if (!user) {
//     throw {
//       statusCode: 401,
//       message: "Invalid credentials.",
//     };
//   }

//   // Worker credentials belong to the Worker collection and must use the
//   // dedicated worker login endpoint.
//   if (user.role === "worker") {
//     throw {
//       statusCode: 403,
//       message: "Please sign in through the worker login.",
//     };
//   }

//   if (user.status !== "active") {
//     throw {
//       statusCode: 403,
//       message: "Your account is blocked.",
//     };
//   }

//   const isMatch =
//     await bcrypt.compare(
//       password,
//       user.passwordHash
//     );

//   if (!isMatch) {
//     throw {
//       statusCode: 401,
//       message: "Invalid credentials.",
//     };
//   }

//   const token = signToken(user);

//   const refreshToken = nanoid(64);

//   if (!Array.isArray(user.refreshTokens)) {
//     user.refreshTokens = [];
//   }

//   user.refreshTokens.push({
//     tokenHash: refreshToken,
//     createdAt: new Date(),
//   });

//   await user.save();

//   return {
//     user: sanitizeUser(user),
//     token,
//     refreshToken,
//   };
// }

// // =====================================================
// // REFRESH AUTH
// // =====================================================

// async function refreshAuth(refreshToken) {
//   if (!refreshToken) {
//     throw {
//       statusCode: 400,
//       message:
//         "Refresh token is required.",
//     };
//   }

//   const user = await User.findOne({
//     "refreshTokens.tokenHash":
//       refreshToken,
//   });

//   if (!user) {
//     throw {
//       statusCode: 401,
//       message:
//         "Invalid refresh token.",
//     };
//   }

//   if (user.status !== "active") {
//     throw {
//       statusCode: 403,
//       message:
//         "Your account is blocked.",
//     };
//   }

//   const token = signToken(user);

//   return {
//     user: sanitizeUser(user),
//     token,
//   };
// }

// // =====================================================
// // LOGOUT
// // =====================================================

// async function logout(
//   userId,
//   refreshToken
// ) {
//   if (refreshToken) {
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $pull: {
//           refreshTokens: {
//             tokenHash: refreshToken,
//           },
//         },
//       }
//     );
//   } else {
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           refreshTokens: [],
//         },
//       }
//     );
//   }

//   return true;
// }

// // =====================================================
// // CREATE GMAIL SMTP TRANSPORTER
// // =====================================================

// function createEmailTransporter() {
//   const emailUser =
//     process.env.EMAIL_USER;

//   const emailPass =
//     process.env.EMAIL_PASS;

//   if (!emailUser || !emailPass) {
//     throw {
//       statusCode: 500,
//       message:
//         "Email configuration is missing on server. Please configure EMAIL_USER and EMAIL_PASS.",
//     };
//   }

//   const emailHost =
//     process.env.EMAIL_HOST ||
//     "smtp.gmail.com";

//   const emailPort =
//     Number(process.env.EMAIL_PORT) || 587;

//   const secure =
//     String(process.env.EMAIL_SECURE).toLowerCase() ===
//     "true";

//   return nodemailer.createTransport({
//     host: emailHost,
//     port: emailPort,
//     secure: secure,

//     auth: {
//       user: emailUser,
//       pass: emailPass,
//     },

//     connectionTimeout: 30000,
//     greetingTimeout: 30000,
//     socketTimeout: 30000,
//   });
// }

// // =====================================================
// // SEND PASSWORD RESET
// // =====================================================

// async function sendPasswordReset(email) {
//   if (!email) {
//     throw {
//       statusCode: 400,
//       message: "Email is required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   // ===================================================
//   // FIND USER
//   // ===================================================

//   const user = await User.findOne({
//     email: normalizedEmail,
//   });

//   // Keep generic response for non-existing emails.
//   if (!user) {
//     return null;
//   }

//   // ===================================================
//   // OPTIONAL ADMIN PROTECTION
//   // ===================================================

//   if (user.role === "admin") {
//     throw {
//       statusCode: 403,
//       message:
//         "Admin users cannot use forgot password. Please contact system administrator.",
//     };
//   }

//   // ===================================================
//   // GENERATE RESET TOKEN
//   // ===================================================

//   const resetToken =
//     crypto
//       .randomBytes(32)
//       .toString("hex");

//   // ===================================================
//   // HASH TOKEN BEFORE DATABASE STORAGE
//   // ===================================================

//   const hashedToken =
//     crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//   user.passwordResetToken =
//     hashedToken;

//   // Token valid for 1 hour
//   user.passwordResetExpires =
//     Date.now() + 60 * 60 * 1000;

//   await user.save();

//   console.log(
//     "Password reset token created for:",
//     normalizedEmail
//   );

//   // ===================================================
//   // CREATE EMAIL TRANSPORTER
//   // ===================================================

//   let transporter;

//   try {
//     transporter =
//       createEmailTransporter();
//   } catch (error) {
//     console.error(
//       "Email transporter configuration error:",
//       error.message
//     );

//     // Remove token because email cannot be sent.
//     user.passwordResetToken =
//       undefined;

//     user.passwordResetExpires =
//       undefined;

//     await user.save({
//       validateBeforeSave: false,
//     });

//     throw error;
//   }

//   // ===================================================
//   // VERIFY GMAIL SMTP
//   // ===================================================

//   try {
//     await transporter.verify();

//     console.log(
//       "Gmail SMTP connection verified successfully"
//     );
//   } catch (smtpError) {
//     console.error(
//       "Gmail SMTP verification failed:",
//       smtpError
//     );

//     // Do not leave a usable token when email failed.
//     user.passwordResetToken =
//       undefined;

//     user.passwordResetExpires =
//       undefined;

//     await user.save({
//       validateBeforeSave: false,
//     });

//     throw {
//       statusCode: 500,
//       message:
//         "Gmail SMTP connection failed. Please check EMAIL_USER and EMAIL_PASS.",
//     };
//   }

//   // ===================================================
//   // FRONTEND RESET URL
//   // ===================================================

//   const frontendUrl =
//     process.env.FRONTEND_URL ||
//     "http://localhost:5173";

//   const resetLink =
//     `${frontendUrl.replace(/\/+$/, "")}` +
//     `/reset-password?token=${encodeURIComponent(
//       resetToken
//     )}`;

//   // ===================================================
//   // EMAIL CONTENT
//   // ===================================================

//   const mailOptions = {
//     from:
//       process.env.EMAIL_FROM ||
//       process.env.EMAIL_USER,

//     to:
//       user.email,

//     subject:
//       "Password Reset Request - Vani",

//     text: `
// Hello ${user.name || "User"},

// We received a request to reset your Vani account password.

// Please use the following link to reset your password:

// ${resetLink}

// This password reset link will expire in 1 hour.

// If you did not request a password reset, you can safely ignore this email.

// Regards,
// Vani Systems Team
//     `.trim(),

//     html: `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <title>Password Reset - Vani</title>
//         </head>

//         <body
//           style="
//             margin:0;
//             padding:0;
//             background:#f5f7fa;
//             font-family:Arial,Helvetica,sans-serif;
//           "
//         >
//           <div
//             style="
//               max-width:600px;
//               margin:40px auto;
//               padding:20px;
//             "
//           >
//             <div
//               style="
//                 background:#ffffff;
//                 border-radius:16px;
//                 padding:32px;
//                 box-shadow:0 4px 18px rgba(0,0,0,0.08);
//               "
//             >

//               <h2
//                 style="
//                   margin:0 0 20px;
//                   color:#142b44;
//                 "
//               >
//                 Vani Systems
//               </h2>

//               <h1
//                 style="
//                   margin:0 0 16px;
//                   color:#142b44;
//                   font-size:28px;
//                 "
//               >
//                 Password Reset Request
//               </h1>

//               <p
//                 style="
//                   color:#526579;
//                   font-size:16px;
//                   line-height:1.6;
//                 "
//               >
//                 Hello ${
//                   user.name || "User"
//                 },
//               </p>

//               <p
//                 style="
//                   color:#526579;
//                   font-size:16px;
//                   line-height:1.6;
//                 "
//               >
//                 We received a request to reset
//                 your Vani account password.
//               </p>

//               <p
//                 style="
//                   color:#526579;
//                   font-size:16px;
//                   line-height:1.6;
//                 "
//               >
//                 Click the button below to create
//                 a new password:
//               </p>

//               <div
//                 style="
//                   text-align:center;
//                   margin:30px 0;
//                 "
//               >
//                 <a
//                   href="${resetLink}"
//                   style="
//                     display:inline-block;
//                     background:#2563eb;
//                     color:#ffffff;
//                     text-decoration:none;
//                     padding:14px 28px;
//                     border-radius:8px;
//                     font-size:16px;
//                     font-weight:bold;
//                   "
//                 >
//                   Reset Password
//                 </a>
//               </div>

//               <p
//                 style="
//                   color:#526579;
//                   font-size:14px;
//                   line-height:1.6;
//                 "
//               >
//                 This link will expire in
//                 <strong>1 hour</strong>.
//               </p>

//               <p
//                 style="
//                   color:#526579;
//                   font-size:14px;
//                   line-height:1.6;
//                 "
//               >
//                 If the button does not work,
//                 copy and paste this link into
//                 your browser:
//               </p>

//               <p
//                 style="
//                   word-break:break-all;
//                   color:#2563eb;
//                   font-size:13px;
//                 "
//               >
//                 ${resetLink}
//               </p>

//               <hr
//                 style="
//                   border:none;
//                   border-top:1px solid #e5e7eb;
//                   margin:30px 0;
//                 "
//               />

//               <p
//                 style="
//                   color:#7a8795;
//                   font-size:13px;
//                   line-height:1.5;
//                 "
//               >
//                 If you did not request a password
//                 reset, you can safely ignore this email.
//               </p>

//               <p
//                 style="
//                   color:#7a8795;
//                   font-size:13px;
//                   margin-top:24px;
//                 "
//               >
//                 Regards,<br />
//                 <strong>Vani Systems Team</strong>
//               </p>

//             </div>
//           </div>
//         </body>
//       </html>
//     `,
//   };

//   // ===================================================
//   // SEND EMAIL
//   // ===================================================

//   try {
//     const info =
//       await transporter.sendMail(
//         mailOptions
//       );

//     console.log(
//       "Password reset email sent successfully."
//     );

//     console.log(
//       "Message ID:",
//       info.messageId
//     );

//     console.log(
//       "Password reset email recipient:",
//       user.email
//     );
//   } catch (emailError) {
//     console.error(
//       "Password reset email sending failed:",
//       emailError
//     );

//     // IMPORTANT:
//     // Do not keep the token if the email was not sent.
//     user.passwordResetToken =
//       undefined;

//     user.passwordResetExpires =
//       undefined;

//     await user.save({
//       validateBeforeSave: false,
//     });

//     throw {
//       statusCode: 500,
//       message:
//         "Unable to send password reset email. Please check the Gmail SMTP configuration.",
//     };
//   }

//   // ===================================================
//   // RETURN RAW TOKEN TO CONTROLLER
//   // ===================================================
//   //
//   // The controller may expose debugToken only when
//   // NODE_ENV is not production.
//   //
//   // The token itself is NOT sent to the user as API
//   // data in production. The user receives it through
//   // the email reset link.
//   // ===================================================

//   return resetToken;
// }

// // =====================================================
// // RESET PASSWORD
// // =====================================================

// async function resetPassword(
//   token,
//   newPassword
// ) {
//   if (!token || !newPassword) {
//     throw {
//       statusCode: 400,
//       message:
//         "Reset token and new password are required.",
//     };
//   }

//   const hashedToken =
//     crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken:
//       hashedToken,

//     passwordResetExpires: {
//       $gt: Date.now(),
//     },
//   });

//   if (!user) {
//     throw {
//       statusCode: 400,
//       message:
//         "Invalid or expired password reset token.",
//     };
//   }

//   const salt = await bcrypt.genSalt(
//     Number(process.env.BCRYPT_ROUNDS) || 12
//   );

//   user.passwordHash =
//     await bcrypt.hash(
//       newPassword,
//       salt
//     );

//   user.passwordResetToken =
//     undefined;

//   user.passwordResetExpires =
//     undefined;

//   user.refreshTokens = [];

//   await user.save();

//   return sanitizeUser(user);
// }

// // =====================================================
// // GET PROFILE
// // =====================================================

// async function getProfile(userId) {
//   const user =
//     await User.findById(userId);

//   if (!user) {
//     throw {
//       statusCode: 404,
//       message: "User not found.",
//     };
//   }

//   return sanitizeUser(user);
// }

// // =====================================================
// // UPDATE USER PROFILE
// // =====================================================

// async function updateUserProfile(
//   userId,
//   payload
// ) {
//   const allowedFields = [
//     "name",
//     "phone",
//     "addresses",
//   ];

//   const updateData = {};

//   for (const field of allowedFields) {
//     if (
//       Object.prototype.hasOwnProperty.call(
//         payload,
//         field
//       )
//     ) {
//       updateData[field] =
//         payload[field];
//     }
//   }

//   // ===================================================
//   // PASSWORD UPDATE
//   // ===================================================

//   if (payload.password) {
//     const salt = await bcrypt.genSalt(
//       Number(process.env.BCRYPT_ROUNDS) || 12
//     );

//     updateData.passwordHash =
//       await bcrypt.hash(
//         payload.password,
//         salt
//       );

//     updateData.refreshTokens = [];
//   }

//   const updatedUser =
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: updateData,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//   if (!updatedUser) {
//     throw {
//       statusCode: 404,
//       message: "User not found.",
//     };
//   }

//   return sanitizeUser(updatedUser);
// }

// // =====================================================
// // EXPORTS
// // =====================================================

// module.exports = {
//   registerUser,
//   loginUser,
//   refreshAuth,
//   logout,
//   sendPasswordReset,
//   resetPassword,
//   getProfile,
//   updateUserProfile,
// };



// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { nanoid } = require("nanoid");
// const crypto = require("crypto");

// // =====================================================
// // GENERATE JWT TOKEN
// // =====================================================

// function signToken(user) {
//   const secret = process.env.JWT_SECRET;

//   if (!secret) {
//     throw new Error("JWT_SECRET is not configured");
//   }

//   return jwt.sign(
//     {
//       id: user._id.toString(),
//       role: user.role,
//     },
//     secret,
//     {
//       expiresIn:
//         process.env.JWT_EXPIRES_IN || "7d",
//     }
//   );
// }

// // =====================================================
// // SANITIZE USER
// // =====================================================

// function sanitizeUser(user) {
//   if (!user) {
//     return null;
//   }

//   const obj = user.toObject
//     ? user.toObject()
//     : { ...user };

//   if (obj._id) {
//     obj.id = obj._id.toString();
//     delete obj._id;
//   }

//   delete obj.password;
//   delete obj.passwordHash;
//   delete obj.refreshTokens;
//   delete obj.passwordResetToken;
//   delete obj.passwordResetExpires;

//   return obj;
// }

// // =====================================================
// // REGISTER NORMAL USER
// // CUSTOMER / ADMIN
// // =====================================================

// async function registerUser(payload) {
//   const {
//     name,
//     email,
//     phone,
//     password,
//     role,
//     adminKey,
//   } = payload;

//   if (!name || !name.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Name is required.",
//     };
//   }

//   if (!email || !email.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Email is required.",
//     };
//   }

//   if (!phone || !phone.trim()) {
//     throw {
//       statusCode: 400,
//       message: "Phone number is required.",
//     };
//   }

//   if (!password) {
//     throw {
//       statusCode: 400,
//       message: "Password is required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   const existing = await User.findOne({
//     email: normalizedEmail,
//   });

//   if (existing) {
//     throw {
//       statusCode: 409,
//       message: "User already exists.",
//     };
//   }

//   let finalRole = "customer";

//   // ===================================================
//   // CUSTOMER
//   // ===================================================

//   if (!role || role === "customer") {
//     finalRole = "customer";
//   }

//   // ===================================================
//   // ADMIN
//   // ===================================================

//   else if (role === "admin") {
//     if (
//       !process.env.ADMIN_REGISTRATION_KEY ||
//       adminKey !==
//         process.env.ADMIN_REGISTRATION_KEY
//     ) {
//       throw {
//         statusCode: 403,
//         message:
//           "Invalid admin registration key.",
//       };
//     }

//     finalRole = "admin";
//   }

//   // ===================================================
//   // WORKER
//   // ===================================================

//   else if (role === "worker") {
//     throw {
//       statusCode: 403,
//       message:
//         "Worker registration must use the worker registration API.",
//     };
//   }

//   else {
//     throw {
//       statusCode: 400,
//       message: "Invalid role.",
//     };
//   }

//   const salt = await bcrypt.genSalt(
//     Number(process.env.BCRYPT_ROUNDS) || 12
//   );

//   const passwordHash =
//     await bcrypt.hash(password, salt);

//   const user = await User.create({
//     name: name.trim(),
//     email: normalizedEmail,
//     phone: phone.trim(),
//     passwordHash,
//     role: finalRole,
//     status: "active",
//   });

//   // ===================================================
//   // ACCESS TOKEN
//   // ===================================================

//   const token = signToken(user);

//   // ===================================================
//   // REFRESH TOKEN
//   // ===================================================

//   const refreshToken = nanoid(64);

//   if (!Array.isArray(user.refreshTokens)) {
//     user.refreshTokens = [];
//   }

//   user.refreshTokens.push({
//     tokenHash: refreshToken,
//     createdAt: new Date(),
//   });

//   await user.save();

//   return {
//     user: sanitizeUser(user),
//     token,
//     refreshToken,
//   };
// }

// // =====================================================
// // LOGIN NORMAL USER
// // =====================================================

// async function loginUser(email, password) {
//   if (!email || !password) {
//     throw {
//       statusCode: 400,
//       message:
//         "Email and password are required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   const user = await User.findOne({
//     email: normalizedEmail,
//   });

//   if (!user) {
//     throw {
//       statusCode: 401,
//       message: "Invalid credentials.",
//     };
//   }

//   // Worker credentials belong to the Worker collection and must use the
//   // dedicated worker login endpoint.
//   if (user.role === "worker") {
//     throw {
//       statusCode: 403,
//       message: "Please sign in through the worker login.",
//     };
//   }

//   if (user.status !== "active") {
//     throw {
//       statusCode: 403,
//       message: "Your account is blocked.",
//     };
//   }

//   const isMatch =
//     await bcrypt.compare(
//       password,
//       user.passwordHash
//     );

//   if (!isMatch) {
//     throw {
//       statusCode: 401,
//       message: "Invalid credentials.",
//     };
//   }

//   const token = signToken(user);

//   const refreshToken = nanoid(64);

//   if (!Array.isArray(user.refreshTokens)) {
//     user.refreshTokens = [];
//   }

//   user.refreshTokens.push({
//     tokenHash: refreshToken,
//     createdAt: new Date(),
//   });

//   await user.save();

//   return {
//     user: sanitizeUser(user),
//     token,
//     refreshToken,
//   };
// }

// // =====================================================
// // REFRESH AUTH
// // =====================================================

// async function refreshAuth(refreshToken) {
//   if (!refreshToken) {
//     throw {
//       statusCode: 400,
//       message:
//         "Refresh token is required.",
//     };
//   }

//   const user = await User.findOne({
//     "refreshTokens.tokenHash":
//       refreshToken,
//   });

//   if (!user) {
//     throw {
//       statusCode: 401,
//       message:
//         "Invalid refresh token.",
//     };
//   }

//   if (user.status !== "active") {
//     throw {
//       statusCode: 403,
//       message:
//         "Your account is blocked.",
//     };
//   }

//   const token = signToken(user);

//   return {
//     user: sanitizeUser(user),
//     token,
//   };
// }

// // =====================================================
// // LOGOUT
// // =====================================================

// async function logout(
//   userId,
//   refreshToken
// ) {
//   if (refreshToken) {
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $pull: {
//           refreshTokens: {
//             tokenHash: refreshToken,
//           },
//         },
//       }
//     );
//   } else {
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           refreshTokens: [],
//         },
//       }
//     );
//   }

//   return true;
// }

// // =====================================================
// // SEND PASSWORD RESET
// // =====================================================

// async function sendPasswordReset(email) {
//   if (!email) {
//     throw {
//       statusCode: 400,
//       message: "Email is required.",
//     };
//   }

//   const normalizedEmail =
//     email.trim().toLowerCase();

//   const user = await User.findOne({
//     email: normalizedEmail,
//   });

//   if (!user) {
//     return null;
//   }

//   const resetToken =
//     crypto
//       .randomBytes(32)
//       .toString("hex");

//   const hashedToken =
//     crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//   user.passwordResetToken =
//     hashedToken;

//   user.passwordResetExpires =
//     Date.now() + 60 * 60 * 1000;

//   await user.save();

//   return resetToken;
// }

// // =====================================================
// // RESET PASSWORD
// // =====================================================

// async function resetPassword(
//   token,
//   newPassword
// ) {
//   if (!token || !newPassword) {
//     throw {
//       statusCode: 400,
//       message:
//         "Reset token and new password are required.",
//     };
//   }

//   const hashedToken =
//     crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken:
//       hashedToken,

//     passwordResetExpires: {
//       $gt: Date.now(),
//     },
//   });

//   if (!user) {
//     throw {
//       statusCode: 400,
//       message:
//         "Invalid or expired password reset token.",
//     };
//   }

//   const salt = await bcrypt.genSalt(
//     Number(process.env.BCRYPT_ROUNDS) || 12
//   );

//   user.passwordHash =
//     await bcrypt.hash(
//       newPassword,
//       salt
//     );

//   user.passwordResetToken =
//     undefined;

//   user.passwordResetExpires =
//     undefined;

//   user.refreshTokens = [];

//   await user.save();

//   return sanitizeUser(user);
// }

// // =====================================================
// // GET PROFILE
// // =====================================================

// async function getProfile(userId) {
//   const user =
//     await User.findById(userId);

//   if (!user) {
//     throw {
//       statusCode: 404,
//       message: "User not found.",
//     };
//   }

//   return sanitizeUser(user);
// }

// // =====================================================
// // UPDATE USER PROFILE
// // =====================================================

// async function updateUserProfile(
//   userId,
//   payload
// ) {
//   const allowedFields = [
//     "name",
//     "phone",
//     "addresses",
//   ];

//   const updateData = {};

//   for (const field of allowedFields) {
//     if (
//       Object.prototype.hasOwnProperty.call(
//         payload,
//         field
//       )
//     ) {
//       updateData[field] =
//         payload[field];
//     }
//   }

//   // ===================================================
//   // PASSWORD UPDATE
//   // ===================================================

//   if (payload.password) {
//     const salt = await bcrypt.genSalt(
//       Number(process.env.BCRYPT_ROUNDS) || 12
//     );

//     updateData.passwordHash =
//       await bcrypt.hash(
//         payload.password,
//         salt
//       );

//     updateData.refreshTokens = [];
//   }

//   const updatedUser =
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: updateData,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//   if (!updatedUser) {
//     throw {
//       statusCode: 404,
//       message: "User not found.",
//     };
//   }

//   return sanitizeUser(updatedUser);
// }

// // =====================================================
// // EXPORTS
// // =====================================================

// module.exports = {
//   registerUser,
//   loginUser,
//   refreshAuth,
//   logout,
//   sendPasswordReset,
//   resetPassword,
//   getProfile,
//   updateUserProfile,
// };

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// =====================================================
// GENERATE JWT TOKEN
// =====================================================

function signToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

// =====================================================
// SANITIZE USER
// =====================================================

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const obj = user.toObject
    ? user.toObject()
    : { ...user };

  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }

  delete obj.password;
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  return obj;
}

// =====================================================
// REGISTER NORMAL USER
// CUSTOMER / ADMIN
// =====================================================

async function registerUser(payload) {
  const {
    name,
    email,
    phone,
    password,
    role,
    adminKey,
  } = payload;

  if (!name || !name.trim()) {
    throw {
      statusCode: 400,
      message: "Name is required.",
    };
  }

  if (!email || !email.trim()) {
    throw {
      statusCode: 400,
      message: "Email is required.",
    };
  }

  if (!phone || !phone.trim()) {
    throw {
      statusCode: 400,
      message: "Phone number is required.",
    };
  }

  if (!password) {
    throw {
      statusCode: 400,
      message: "Password is required.",
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const existing = await User.findOne({
    email: normalizedEmail,
  });

  if (existing) {
    throw {
      statusCode: 409,
      message: "User already exists.",
    };
  }

  let finalRole = "customer";

  // ===================================================
  // CUSTOMER
  // ===================================================

  if (!role || role === "customer") {
    finalRole = "customer";
  }

  // ===================================================
  // ADMIN
  // ===================================================

  else if (role === "admin") {
    if (
      !process.env.ADMIN_REGISTRATION_KEY ||
      adminKey !==
        process.env.ADMIN_REGISTRATION_KEY
    ) {
      throw {
        statusCode: 403,
        message:
          "Invalid admin registration key.",
      };
    }

    finalRole = "admin";
  }

  // ===================================================
  // WORKER
  // ===================================================

  else if (role === "worker") {
    throw {
      statusCode: 403,
      message:
        "Worker registration must use the worker registration API.",
    };
  }

  else {
    throw {
      statusCode: 400,
      message: "Invalid role.",
    };
  }

  const salt = await bcrypt.genSalt(
    Number(process.env.BCRYPT_ROUNDS) || 12
  );

  const passwordHash =
    await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordHash,
    role: finalRole,
    status: "active",
  });

  // ===================================================
  // ACCESS TOKEN
  // ===================================================

  const token = signToken(user);

  // ===================================================
  // REFRESH TOKEN
  // ===================================================

  const refreshToken = nanoid(64);

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }

  user.refreshTokens.push({
    tokenHash: refreshToken,
    createdAt: new Date(),
  });

  await user.save();

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
}

// =====================================================
// LOGIN NORMAL USER
// =====================================================

async function loginUser(email, password) {
  if (!email || !password) {
    throw {
      statusCode: 400,
      message:
        "Email and password are required.",
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw {
      statusCode: 401,
      message: "Invalid credentials.",
    };
  }

  // Worker credentials belong to the Worker collection and must use the
  // dedicated worker login endpoint.
  if (user.role === "worker") {
    throw {
      statusCode: 403,
      message: "Please sign in through the worker login.",
    };
  }

  if (user.status !== "active") {
    throw {
      statusCode: 403,
      message: "Your account is blocked.",
    };
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!isMatch) {
    throw {
      statusCode: 401,
      message: "Invalid credentials.",
    };
  }

  const token = signToken(user);

  const refreshToken = nanoid(64);

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }

  user.refreshTokens.push({
    tokenHash: refreshToken,
    createdAt: new Date(),
  });

  await user.save();

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
}

// =====================================================
// REFRESH AUTH
// =====================================================

async function refreshAuth(refreshToken) {
  if (!refreshToken) {
    throw {
      statusCode: 400,
      message:
        "Refresh token is required.",
    };
  }

  const user = await User.findOne({
    "refreshTokens.tokenHash":
      refreshToken,
  });

  if (!user) {
    throw {
      statusCode: 401,
      message:
        "Invalid refresh token.",
    };
  }

  if (user.status !== "active") {
    throw {
      statusCode: 403,
      message:
        "Your account is blocked.",
    };
  }

  const token = signToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

// =====================================================
// LOGOUT
// =====================================================

async function logout(
  userId,
  refreshToken
) {
  if (refreshToken) {
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          refreshTokens: {
            tokenHash: refreshToken,
          },
        },
      }
    );
  } else {
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshTokens: [],
        },
      }
    );
  }

  return true;
}

// =====================================================
// CREATE GMAIL SMTP TRANSPORTER
// =====================================================

function createEmailTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw {
      statusCode: 500,
      message:
        "Email configuration is missing on server. Please configure EMAIL_USER and EMAIL_PASS.",
    };
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    family: 4,

    lookup: (hostname, options, callback) => {
      dns.lookup(
        hostname,
        {
          family: 4,
          all: false,
        },
        callback
      );
    },

    auth: {
      user: emailUser,
      pass: emailPass,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    dnsTimeout: 30000,
  });
}
// =====================================================
// SEND PASSWORD RESET
// =====================================================

async function sendPasswordReset(email) {
  if (!email) {
    throw {
      statusCode: 400,
      message: "Email is required.",
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  // ===================================================
  // FIND USER
  // ===================================================

  const user = await User.findOne({
    email: normalizedEmail,
  });

  // Keep generic response for non-existing emails.
  if (!user) {
    return null;
  }

  // ===================================================
  // OPTIONAL ADMIN PROTECTION
  // ===================================================

  if (user.role === "admin") {
    throw {
      statusCode: 403,
      message:
        "Admin users cannot use forgot password. Please contact system administrator.",
    };
  }

  // ===================================================
  // GENERATE RESET TOKEN
  // ===================================================

  const resetToken =
    crypto
      .randomBytes(32)
      .toString("hex");

  // ===================================================
  // HASH TOKEN BEFORE DATABASE STORAGE
  // ===================================================

  const hashedToken =
    crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

  user.passwordResetToken =
    hashedToken;

  // Token valid for 1 hour
  user.passwordResetExpires =
    Date.now() + 60 * 60 * 1000;

  await user.save();

  console.log(
    "Password reset token created for:",
    normalizedEmail
  );

  // ===================================================
  // CREATE EMAIL TRANSPORTER
  // ===================================================

  let transporter;

  try {
    transporter =
      createEmailTransporter();
  } catch (error) {
    console.error(
      "Email transporter configuration error:",
      error.message
    );

    // Remove token because email cannot be sent.
    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw error;
  }

  // ===================================================
  // VERIFY GMAIL SMTP
  // ===================================================

  try {
    await transporter.verify();

    console.log(
      "Gmail SMTP connection verified successfully"
    );
  } catch (smtpError) {
    console.error(
      "Gmail SMTP verification failed:",
      smtpError
    );

    // Do not leave a usable token when email failed.
    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw {
      statusCode: 500,
      message:
        "Gmail SMTP connection failed. Please check EMAIL_USER and EMAIL_PASS.",
    };
  }

  // ===================================================
  // FRONTEND RESET URL
  // ===================================================

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const resetLink =
    `${frontendUrl.replace(/\/+$/, "")}` +
    `/reset-password?token=${encodeURIComponent(
      resetToken
    )}`;

  // ===================================================
  // EMAIL CONTENT
  // ===================================================

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER,

    to:
      user.email,

    subject:
      "Password Reset Request - Vani",

    text: `
Hello ${user.name || "User"},

We received a request to reset your Vani account password.

Please use the following link to reset your password:

${resetLink}

This password reset link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

Regards,
Vani Systems Team
    `.trim(),

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset - Vani</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f7fa;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <div
            style="
              max-width:600px;
              margin:40px auto;
              padding:20px;
            "
          >
            <div
              style="
                background:#ffffff;
                border-radius:16px;
                padding:32px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
              "
            >

              <h2
                style="
                  margin:0 0 20px;
                  color:#142b44;
                "
              >
                Vani Systems
              </h2>

              <h1
                style="
                  margin:0 0 16px;
                  color:#142b44;
                  font-size:28px;
                "
              >
                Password Reset Request
              </h1>

              <p
                style="
                  color:#526579;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Hello ${
                  user.name || "User"
                },
              </p>

              <p
                style="
                  color:#526579;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                We received a request to reset
                your Vani account password.
              </p>

              <p
                style="
                  color:#526579;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Click the button below to create
                a new password:
              </p>

              <div
                style="
                  text-align:center;
                  margin:30px 0;
                "
              >
                <a
                  href="${resetLink}"
                  style="
                    display:inline-block;
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:8px;
                    font-size:16px;
                    font-weight:bold;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p
                style="
                  color:#526579;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                This link will expire in
                <strong>1 hour</strong>.
              </p>

              <p
                style="
                  color:#526579;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                If the button does not work,
                copy and paste this link into
                your browser:
              </p>

              <p
                style="
                  word-break:break-all;
                  color:#2563eb;
                  font-size:13px;
                "
              >
                ${resetLink}
              </p>

              <hr
                style="
                  border:none;
                  border-top:1px solid #e5e7eb;
                  margin:30px 0;
                "
              />

              <p
                style="
                  color:#7a8795;
                  font-size:13px;
                  line-height:1.5;
                "
              >
                If you did not request a password
                reset, you can safely ignore this email.
              </p>

              <p
                style="
                  color:#7a8795;
                  font-size:13px;
                  margin-top:24px;
                "
              >
                Regards,<br />
                <strong>Vani Systems Team</strong>
              </p>

            </div>
          </div>
        </body>
      </html>
    `,
  };

  // ===================================================
  // SEND EMAIL
  // ===================================================

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Password reset email sent successfully."
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    console.log(
      "Password reset email recipient:",
      user.email
    );
  } catch (emailError) {
    console.error(
      "Password reset email sending failed:",
      emailError
    );

    // IMPORTANT:
    // Do not keep the token if the email was not sent.
    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw {
      statusCode: 500,
      message:
        "Unable to send password reset email. Please check the Gmail SMTP configuration.",
    };
  }

  // ===================================================
  // RETURN RAW TOKEN TO CONTROLLER
  // ===================================================
  //
  // The controller may expose debugToken only when
  // NODE_ENV is not production.
  //
  // The token itself is NOT sent to the user as API
  // data in production. The user receives it through
  // the email reset link.
  // ===================================================

  return resetToken;
}

// =====================================================
// RESET PASSWORD
// =====================================================

async function resetPassword(
  token,
  newPassword
) {
  if (!token || !newPassword) {
    throw {
      statusCode: 400,
      message:
        "Reset token and new password are required.",
    };
  }

  const hashedToken =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  const user = await User.findOne({
    passwordResetToken:
      hashedToken,

    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw {
      statusCode: 400,
      message:
        "Invalid or expired password reset token.",
    };
  }

  const salt = await bcrypt.genSalt(
    Number(process.env.BCRYPT_ROUNDS) || 12
  );

  user.passwordHash =
    await bcrypt.hash(
      newPassword,
      salt
    );

  user.passwordResetToken =
    undefined;

  user.passwordResetExpires =
    undefined;

  user.refreshTokens = [];

  await user.save();

  return sanitizeUser(user);
}

// =====================================================
// GET PROFILE
// =====================================================

async function getProfile(userId) {
  const user =
    await User.findById(userId);

  if (!user) {
    throw {
      statusCode: 404,
      message: "User not found.",
    };
  }

  return sanitizeUser(user);
}

// =====================================================
// UPDATE USER PROFILE
// =====================================================

async function updateUserProfile(
  userId,
  payload
) {
  const allowedFields = [
    "name",
    "phone",
    "addresses",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        field
      )
    ) {
      updateData[field] =
        payload[field];
    }
  }

  // ===================================================
  // PASSWORD UPDATE
  // ===================================================

  if (payload.password) {
    const salt = await bcrypt.genSalt(
      Number(process.env.BCRYPT_ROUNDS) || 12
    );

    updateData.passwordHash =
      await bcrypt.hash(
        payload.password,
        salt
      );

    updateData.refreshTokens = [];
  }

  const updatedUser =
    await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!updatedUser) {
    throw {
      statusCode: 404,
      message: "User not found.",
    };
  }

  return sanitizeUser(updatedUser);
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  registerUser,
  loginUser,
  refreshAuth,
  logout,
  sendPasswordReset,
  resetPassword,
  getProfile,
  updateUserProfile,
};

















