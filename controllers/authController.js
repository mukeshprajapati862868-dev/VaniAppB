const { validationResult } = require('express-validator');
const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const result = await authService.registerUser(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'error', message: 'Email is required.' });
    const token = await authService.sendPasswordReset(email);
    const response = { status: 'success', message: 'If this email exists, a reset link has been sent.' };
    if (process.env.NODE_ENV !== 'production' && token) response.debugToken = token;
    res.json(response);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ status: 'error', message: 'Token and newPassword are required.' });
    const user = await authService.resetPassword(token, newPassword);
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ status: 'error', message: 'refreshToken is required.' });
    const result = await authService.refreshAuth(refreshToken);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user.id, refreshToken);
    res.json({ status: 'success', message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateUserProfile(req.user.id, req.body);
    res.json({ status: 'success', data: { user: updated } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  getMe,
  updateProfile,
};
