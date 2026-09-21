const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// =====================================================
// GENERATE JWT TOKEN
// =====================================================

function signToken(admin) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: admin._id.toString(),
      role: admin.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

// =====================================================
// SANITIZE ADMIN
// =====================================================

function sanitizeAdmin(admin) {
  if (!admin) {
    return null;
  }

  const obj = admin.toObject ? admin.toObject() : { ...admin };

  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }

  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  return obj;
}

// =====================================================
// REGISTER ADMIN
// =====================================================

async function registerAdmin(payload) {
  const { name, email, phone, password, adminKey } = payload;

  // Validate admin key
  if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
    throw {
      statusCode: 403,
      message: "Invalid admin registration key.",
    };
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw {
      statusCode: 409,
      message: "Admin with this email already exists.",
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    phone,
    passwordHash,
    role: "admin",
    status: "active",
  });

  const token = signToken(admin);

  return {
    admin: sanitizeAdmin(admin),
    token,
  };
}

// =====================================================
// LOGIN ADMIN
// =====================================================

async function loginAdmin(email, password) {
  // Find admin by email
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw {
      statusCode: 401,
      message: "Invalid email or password.",
    };
  }

  // Check if admin is blocked
  if (admin.status === "blocked") {
    throw {
      statusCode: 403,
      message: "Your admin account has been blocked.",
    };
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw {
      statusCode: 401,
      message: "Invalid email or password.",
    };
  }

  // Generate token
  const token = signToken(admin);

  return {
    admin: sanitizeAdmin(admin),
    token,
  };
}

// =====================================================
// GET ADMIN PROFILE
// =====================================================

async function getAdminProfile(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw {
      statusCode: 404,
      message: "Admin not found.",
    };
  }

  return sanitizeAdmin(admin);
}

// =====================================================
// UPDATE ADMIN PROFILE
// =====================================================

async function updateAdminProfile(adminId, payload) {
  const { name, phone, password } = payload;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!admin) {
    throw {
      statusCode: 404,
      message: "Admin not found.",
    };
  }

  return sanitizeAdmin(admin);
}

// =====================================================
// LOGOUT ADMIN
// =====================================================

async function logoutAdmin(adminId) {
  await Admin.findByIdAndUpdate(adminId, { refreshTokens: [] });
  return { message: "Logged out successfully." };
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
};
