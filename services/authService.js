const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const crypto = require("crypto");

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

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return null;
  }

  const resetToken =
    crypto
      .randomBytes(32)
      .toString("hex");

  const hashedToken =
    crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

  user.passwordResetToken =
    hashedToken;

  user.passwordResetExpires =
    Date.now() + 60 * 60 * 1000;

  await user.save();

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
