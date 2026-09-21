const adminService = require('../services/adminService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/* ===============================
   ADMIN REGISTER
=============================== */
async function registerAdmin(req, res, next) {
  try {
    const { name, email, phone, password, adminKey } = req.body;

    if (!name || !email || !phone || !password || !adminKey) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required (name, email, phone, password, adminKey)'
      });
    }

    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid Admin Registration Key'
      });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Admin with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    admin.passwordHash = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Admin registered successfully',
      data: { admin }
    });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   ADMIN LOGIN
=============================== */
async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin account is blocked'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    admin.passwordHash = undefined;

    res.json({
      status: 'success',
      message: 'Admin logged in successfully',
      data: {
        token,
        admin
      }
    });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   DASHBOARD
=============================== */
async function dashboard(req, res, next) {
  try {
    const data = await adminService.getDashboardStats();
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   USERS
=============================== */
async function listUsers(req, res, next) {
  try {
    const users = await adminService.listUsers();
    res.json({ status: 'success', data: users });
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   WORKERS
=============================== */
async function listWorkers(req, res, next) {
  try {
    res.json({ status: 'success', data: await adminService.listWorkers() });
  } catch (err) {
    next(err);
  }
}

async function updateWorkerStatus(req, res, next) {
  try {
    const worker = await adminService.updateWorkerStatus(req.params.id, req.body.status);
    if (!worker) return res.status(404).json({ status: 'error', message: 'Worker not found.' });
    res.json({ status: 'success', data: worker });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   REQUESTS
=============================== */
async function listRequests(req, res, next) {
  try {
    const requests = await adminService.listRequests();
    res.json({ status: 'success', data: requests });
  } catch (err) {
    next(err);
  }
}

async function updateRequestStatus(req, res, next) {
  try {
    const request = await adminService.updateRequestStatus(req.params.id, req.body.status);
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });
    res.json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   CONTENT
=============================== */
async function getContent(req, res, next) {
  try {
    const content = await adminService.getContent();
    res.json({ status: 'success', data: content });
  } catch (err) {
    next(err);
  }
}

async function updateContent(req, res, next) {
  try {
    const updated = await adminService.updateContent(req.body);
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   CATALOG
=============================== */
async function listCatalog(req, res, next) {
  try {
    const catalog = await adminService.listCatalog();
    res.json({ status: 'success', data: catalog });
  } catch (err) {
    next(err);
  }
}

async function createCatalog(req, res, next) {
  try {
    const product = await adminService.createCatalogProduct(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function updateCatalog(req, res, next) {
  try {
    const product = await adminService.updateCatalogProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found.' });
    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

/* ===============================
   BOOKING MONITORING
=============================== */
async function getBookingWithWorkerDetails(req, res, next) {
  try {
    const Booking = require("../models/Booking");
    const BookingRequest = require("../models/BookingRequest");
    const Worker = require("../models/Worker");

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("userId")
      .populate("workerId")
      .populate("products.productId");

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    const bookingRequests = await BookingRequest.find({
      bookingId,
    })
      .populate("workerId")
      .sort({ createdAt: -1 });

    const workerDetails = booking.workerId
      ? await Worker.findById(booking.workerId).lean()
      : null;

    return res.json({
      status: "success",
      data: {
        booking,
        workerDetails,
        bookingRequests,
        totalRequests: bookingRequests.length,
        acceptedRequests: bookingRequests.filter(
          (r) => r.status === "ACCEPTED"
        ).length,
        rejectedRequests: bookingRequests.filter(
          (r) => r.status === "REJECTED"
        ).length,
        pendingRequests: bookingRequests.filter(
          (r) => r.status === "PENDING" || r.status === "SENT"
        ).length,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllBookingRequests(req, res, next) {
  try {
    const BookingRequest = require("../models/BookingRequest");

    const requests = await BookingRequest.find()
      .populate("bookingId")
      .populate("workerId")
      .populate("userId")
      .populate("serviceId")
      .sort({ createdAt: -1 });

    return res.json({
      status: "success",
      data: requests,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  dashboard,
  listUsers,
  updateUserStatus,
  listWorkers,
  updateWorkerStatus,
  listRequests,
  updateRequestStatus,
  getContent,
  updateContent,
  listCatalog,
  createCatalog,
  updateCatalog,
  getBookingWithWorkerDetails,
  getAllBookingRequests,
};