const Product = require("../models/Product");
const User = require("../models/User"); // सुनिश्चित करें कि models फ़ोल्डर में User.js मौजूद है

/**
 * IMPORT: Storage utility (Only for requests/bookings/content if they are still file-based)
 */
const storage = require("../utils/storage");
const Worker = require("../models/Worker");

/**
 * Service: adminService
 * Purpose: Business logic for Admin dashboard and data management connected to MongoDB.
 */

// CALLED BY: adminController.dashboard
async function getDashboardStats() {
  // यूज़र्स और प्रोडक्ट्स की संख्या सीधे MongoDB से लाएं
  const totalUsers = await User.countDocuments({});
  const activeUsers = await User.countDocuments({ status: "active" });
  const blockedUsers = await User.countDocuments({ status: "blocked" });
  const totalProducts = await Product.countDocuments({});

  // बुकिंग और रिक्वेस्ट यदि अभी भी फ़ाइल में हैं, तो उन्हें स्टोरेज से ही गिनें
  const bookings = await storage.getAllBookings();
  const requests = await storage.getAllRequests();

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    totalProducts, // अब डैशबोर्ड में सही प्रोडक्ट काउंट दिखेगा
    pendingRequests: requests.filter((request) => request.status === "pending")
      .length,
    totalBookings: bookings.length,
  };
}

// CALLED BY: adminController.listUsers
async function listUsers() {
  // सीधे MongoDB से सभी यूज़र्स की लिस्ट निकालें (बिना पासवर्ड के)
  return User.find({}).select("-passwordHash");
}

// CALLED BY: adminController.updateUserStatus
async function updateUserStatus(userId, status) {
  // MongoDB में यूज़र का स्टेटस अपडेट करें
  return User.findByIdAndUpdate(userId, { status }, { new: true });
}

async function listWorkers() {
  return Worker.find({}).select("-passwordHash").sort({ createdAt: -1 });
}

async function updateWorkerStatus(workerId, status) {
  if (!['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
    throw { statusCode: 400, message: 'Invalid worker status.' };
  }
  return Worker.findByIdAndUpdate(workerId, { status }, { new: true, runValidators: true }).select('-passwordHash');
}

// CALLED BY: adminController.listRequests
async function listRequests() {
  return storage.getAllRequests();
}

// CALLED BY: adminController.updateRequestStatus
async function updateRequestStatus(requestId, status) {
  return storage.updateRequestStatus(requestId, status);
}

// CALLED BY: adminController.getContent
async function getContent() {
  return storage.getContentConfig();
}

// CALLED BY: adminController.updateContent
async function updateContent(payload) {
  return storage.updateContentConfig(payload);
}

/**
 * ========================================================
 * PRODUCT CATALOG MANAGEMENT (MONGODB FORCED INTEGRATION)
 * ========================================================
 */

// CALLED BY: adminController.listCatalog
async function listCatalog() {
  // सीधे MongoDB से सारे प्रोडक्ट्स लेटेस्ट के आधार पर लाएं
  return Product.find({}).sort({ createdAt: -1 });
}

// CALLED BY: adminController.createCatalog
async function createCatalogProduct(payload) {
  // फ़ाइल स्टोरेज हटाकर सीधे MongoDB Collection में डेटा इन्सर्ट करें
  const newProduct = await Product.create(payload);
  return newProduct;
}

// CALLED BY: adminController.updateCatalog
async function updateCatalogProduct(productId, payload) {
  // MongoDB में दी गई ID के प्रोडक्ट को अपडेट करें
  return Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserStatus,
  listWorkers,
  updateWorkerStatus,
  listRequests,
  updateRequestStatus,
  getContent,
  updateContent,
  listCatalog,
  createCatalogProduct,
  updateCatalogProduct,
};
