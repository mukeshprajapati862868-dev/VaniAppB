const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const DATA_FILE = path.join(__dirname, '..', 'data', 'app-data.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          users: [],
          products: [],
          categories: [],
          carts: [],
          bookings: [],
          addresses: [],
          requests: [],
          contentConfig: null,
        },
        null,
        2,
      ),
    );
  }
}

function readStore() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeStore(store) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function createId(prefix) {
  return `${prefix}_${nanoid(10)}`;
}

function now() {
  return new Date().toISOString();
}

function findById(records, id) {
  return records.find((item) => String(item._id) === String(id) || String(item.id) === String(id)) || null;
}

async function ensureSeedData() {
  const store = readStore();

  if (store.categories.length === 0) {
    const categories = [
      { _id: createId('category'), id: createId('category'), name: 'Spa for Women', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15', description: 'Beauty and wellness services', createdAt: now(), updatedAt: now() },
      { _id: createId('category'), id: createId('category'), name: 'Salon for Men', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', description: 'Grooming and haircut services', createdAt: now(), updatedAt: now() },
    ];

    store.categories.push(...categories);

    store.products.push(
      {
        _id: createId('product'),
        id: createId('product'),
        title: 'Luxury Facial',
        description: 'Deep cleansing and glow facial',
        price: 1499,
        offerPrice: 1299,
        category: categories[0].name,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
        rating: 4.7,
        reviews: 128,
        brand: 'Vani',
        sku: 'FAC-001',
        features: ['Glow', 'Hydration'],
        specifications: { duration: '60 min' },
        deliveryInfo: 'At-home service available',
        returnPolicy: 'Non-refundable after booking',
        warranty: 'Service warranty available',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        _id: createId('product'),
        id: createId('product'),
        title: 'Hair Styling',
        description: 'Premium haircut and styling',
        price: 799,
        offerPrice: 599,
        category: categories[1].name,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
        rating: 4.5,
        reviews: 80,
        brand: 'Vani',
        sku: 'HAIR-001',
        features: ['Styling', 'Wash'],
        specifications: { duration: '45 min' },
        deliveryInfo: 'Salon visit',
        returnPolicy: 'Non-refundable after booking',
        warranty: 'Service warranty available',
        createdAt: now(),
        updatedAt: now(),
      },
    );
  }

  if (!store.contentConfig) {
    store.contentConfig = {
      _id: createId('content'),
      id: createId('content'),
      appName: 'VaniSystem',
      welcomeText: 'Welcome to VaniSystem',
      sections: ['Featured', 'Popular', 'Offers'],
      products: store.products.slice(0, 2).map((item) => item._id),
      createdAt: now(),
      updatedAt: now(),
    };
  }

  const hasAdmin = store.users.some((user) => user.role === 'admin');
  if (!hasAdmin) {
    const passwordHash = await bcrypt.hash('Rajiv@2003', 10);
    store.users.push({
      _id: createId('user'),
      id: createId('user'),
      name: 'Admin Vani',
      email: 'admin@vani.com',
      phone: '9999999999',
      passwordHash,
      role: 'admin',
      status: 'active',
      refreshTokens: [],
      createdAt: now(),
      updatedAt: now(),
    });
  }

  writeStore(store);
  return store;
}

async function createUser(input) {
  const store = readStore();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = {
    _id: createId('user'),
    id: createId('user'),
    name: input.name,
    email: String(input.email).toLowerCase(),
    phone: input.phone,
    passwordHash,
    role: input.role || 'customer',
    status: input.status || 'active',
    refreshTokens: [],
    createdAt: now(),
    updatedAt: now(),
  };
  store.users.push(user);
  writeStore(store);
  return user;
}

async function getUserByEmail(email) {
  const store = readStore();
  return store.users.find((user) => user.email === String(email).toLowerCase()) || null;
}

async function getUserById(userId) {
  const store = readStore();
  return findById(store.users, userId) || null;
}

function sanitizeUser(user) {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.refreshTokens;
  delete safeUser.passwordResetToken;
  delete safeUser.passwordResetExpires;
  safeUser._id = safeUser._id || safeUser.id;
  safeUser.id = safeUser.id || safeUser._id;
  return safeUser;
}

async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

function signToken(user) {
  return jwt.sign({ id: user._id || user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

async function addRefreshToken(userId, token) {
  const store = readStore();
  const user = findById(store.users, userId);
  if (!user) return null;
  const tokenHash = await bcrypt.hash(token, 10);
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({ tokenHash, createdAt: now() });
  user.updatedAt = now();
  writeStore(store);
  return true;
}

async function revokeRefreshToken(userId, token) {
  const store = readStore();
  const user = findById(store.users, userId);
  if (!user || !user.refreshTokens) return null;
  const survivors = [];
  for (const t of user.refreshTokens) {
    const match = await bcrypt.compare(token, t.tokenHash).catch(() => false);
    if (!match) survivors.push(t);
  }
  user.refreshTokens = survivors;
  user.updatedAt = now();
  writeStore(store);
  return true;
}

async function revokeAllRefreshTokens(userId) {
  const store = readStore();
  const user = findById(store.users, userId);
  if (!user) return null;
  user.refreshTokens = [];
  user.updatedAt = now();
  writeStore(store);
  return true;
}

async function findUserByRefreshToken(token) {
  const store = readStore();
  for (const user of store.users) {
    for (const t of user.refreshTokens || []) {
      const match = await bcrypt.compare(token, t.tokenHash).catch(() => false);
      if (match) return user;
    }
  }
  return null;
}

async function setPasswordResetToken(email) {
  const store = readStore();
  const user = store.users.find((item) => item.email === String(email).toLowerCase());
  if (!user) return null;
  const token = nanoid(32);
  const tokenHash = await bcrypt.hash(token, 10);
  user.passwordResetToken = tokenHash;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  user.updatedAt = now();
  writeStore(store);
  return token;
}

async function resetPasswordWithToken(token, newPassword) {
  const store = readStore();
  for (const user of store.users) {
    const match = await bcrypt.compare(token, user.passwordResetToken || '').catch(() => false);
    if (!match) continue;
    if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) return null;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = now();
    writeStore(store);
    return user;
  }
  return null;
}

async function getCartByUserId(userId) {
  const store = readStore();
  return store.carts.find((cart) => String(cart.userId) === String(userId)) || null;
}

async function createCartForUser(userId) {
  const store = readStore();
  const existing = store.carts.find((cart) => String(cart.userId) === String(userId));
  if (existing) return existing;
  const cart = {
    _id: createId('cart'),
    id: createId('cart'),
    userId,
    items: [],
    subtotal: 0,
    discountAmount: 0,
    deliveryCharge: 0,
    gstAmount: 0,
    grandTotal: 0,
    createdAt: now(),
    updatedAt: now(),
  };
  store.carts.push(cart);
  writeStore(store);
  return cart;
}

async function saveCart(cart) {
  const store = readStore();
  const index = store.carts.findIndex((item) => String(item._id) === String(cart._id));
  if (index >= 0) {
    store.carts[index] = { ...store.carts[index], ...cart, updatedAt: now() };
  } else {
    store.carts.push({ ...cart, updatedAt: now() });
  }
  writeStore(store);
  return cart;
}

function recalculateCart(cart) {
  const subtotal = (cart.items || []).reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
  const discountAmount = Math.round(subtotal * 0.05);
  const deliveryCharge = subtotal > 0 ? 99 : 0;
  const gstAmount = Math.round((subtotal - discountAmount + deliveryCharge) * 0.18);
  const grandTotal = subtotal - discountAmount + deliveryCharge + gstAmount;
  cart.subtotal = subtotal;
  cart.discountAmount = discountAmount;
  cart.deliveryCharge = deliveryCharge;
  cart.gstAmount = gstAmount;
  cart.grandTotal = grandTotal;
  return cart;
}

async function getBookingsByUserId(userId) {
  const store = readStore();
  return store.bookings.filter((booking) => String(booking.userId) === String(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getAllBookings() {
  const store = readStore();
  return [...store.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getAllUsers() {
  const store = readStore();
  return store.users.map((user) => sanitizeUser(user));
}

async function addAddress(userId, payload) {
  const store = readStore();
  const address = {
    _id: createId('address'),
    id: createId('address'),
    userId,
    ...payload,
    createdAt: now(),
    updatedAt: now(),
  };
  store.addresses.push(address);
  writeStore(store);
  return address;
}

async function getAddressesByUserId(userId) {
  const store = readStore();
  return store.addresses.filter((address) => String(address.userId) === String(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function addRequest(payload) {
  const store = readStore();
  const request = {
    _id: createId('request'),
    id: createId('request'),
    status: 'pending',
    ...payload,
    createdAt: now(),
    updatedAt: now(),
  };
  store.requests.push(request);
  writeStore(store);
  return request;
}

async function getAllRequests() {
  const store = readStore();
  return [...store.requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getContentConfig() {
  const store = readStore();
  return store.contentConfig;
}

async function updateContentConfig(payload) {
  const store = readStore();
  store.contentConfig = {
    ...(store.contentConfig || {}),
    ...payload,
    _id: store.contentConfig?._id || createId('content'),
    id: store.contentConfig?.id || createId('content'),
    updatedAt: now(),
  };
  writeStore(store);
  return store.contentConfig;
}

async function addBooking(payload) {
  const store = readStore();
  if (!payload.orderId) payload.orderId = `ORD-${nanoid(8)}`;
  if (!payload.bookingId) payload.bookingId = `BK-${nanoid(8)}`;

  const booking = {
    _id: createId('booking'),
    id: createId('booking'),
    ...payload,
    createdAt: now(),
    updatedAt: now(),
  };
  store.bookings.push(booking);

  try {
    if (payload.userId && payload.address && (payload.address.city || payload.address.pincode || payload.address.state)) {
      await addAddress(payload.userId, {
        houseNo: payload.address.houseNo || '',
        landmark: payload.address.landmark || '',
        city: payload.address.city || '',
        state: payload.address.state || '',
        pincode: payload.address.pincode || '',
        isDefault: false,
      });
    }
  } catch (err) {
    console.error('Failed to save address after booking:', err.message || err);
  }

  writeStore(store);
  return booking;
}

async function getBookingById(bookingId) {
  const store = readStore();
  return findById(store.bookings, bookingId) || null;
}

async function updateBookingStatus(bookingId, status) {
  const store = readStore();
  const booking = findById(store.bookings, bookingId);
  if (!booking) return null;
  booking.bookingStatus = status;
  booking.updatedAt = now();
  writeStore(store);
  return booking;
}

async function updateUserStatus(userId, status) {
  const store = readStore();
  const user = findById(store.users, userId);
  if (!user) return null;
  user.status = status;
  user.updatedAt = now();
  writeStore(store);
  return user;
}

async function updateRequestStatus(requestId, status) {
  const store = readStore();
  const request = findById(store.requests, requestId);
  if (!request) return null;
  request.status = status;
  request.updatedAt = now();
  writeStore(store);
  return request;
}

async function updateProfile(userId, payload) {
  const store = readStore();
  const user = findById(store.users, userId);
  if (!user) return null;
  Object.assign(user, payload, { updatedAt: now() });
  writeStore(store);
  return sanitizeUser(user);
}

async function listProducts({ q, category } = {}) {
  const store = readStore();
  let items = [...store.products];
  if (category) {
    items = items.filter((item) => String(item.category).toLowerCase() === String(category).toLowerCase());
  }
  if (q) {
    const value = String(q).toLowerCase();
    items = items.filter((item) => [item.title, item.description, item.category].some((field) => String(field || '').toLowerCase().includes(value)));
  }
  return items;
}

async function getProductById(productId) {
  const store = readStore();
  return findById(store.products, productId) || null;
}

async function searchProducts(q) {
  return listProducts({ q });
}

async function listProductsByCategory(categoryId) {
  return listProducts({ category: categoryId });
}

async function getAllProducts() {
  const store = readStore();
  return [...store.products];
}

async function createProduct(payload) {
  const store = readStore();
  const product = {
    _id: createId('product'),
    id: createId('product'),
    ...payload,
    createdAt: now(),
    updatedAt: now(),
  };
  store.products.push(product);
  writeStore(store);
  return product;
}

async function updateProduct(productId, payload) {
  const store = readStore();
  const product = findById(store.products, productId);
  if (!product) return null;
  Object.assign(product, payload, { updatedAt: now() });
  writeStore(store);
  return product;
}

module.exports = {
  ensureSeedData,
  createUser,
  getUserByEmail,
  getUserById,
  sanitizeUser,
  comparePassword,
  signToken,
  getCartByUserId,
  createCartForUser,
  saveCart,
  recalculateCart,
  addBooking,
  getBookingsByUserId,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getAllUsers,
  addAddress,
  getAddressesByUserId,
  updateProfile,
  addRequest,
  getAllRequests,
  updateRequestStatus,
  getContentConfig,
  updateContentConfig,
  updateUserStatus,
  addRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  findUserByRefreshToken,
  setPasswordResetToken,
  resetPasswordWithToken,
  listProducts,
  getProductById,
  searchProducts,
  listProductsByCategory,
  getAllProducts,
  createProduct,
  updateProduct,
};
