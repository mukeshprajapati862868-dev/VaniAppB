const userService = require("../services/userService");
const authService = require("../services/authService");

function sanitizeUser(user) {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.id = userObj._id.toString();
  delete userObj._id;

  delete userObj.passwordHash;
  delete userObj.refreshTokens;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  return userObj;
}

async function getProfile(req, res, next) {
  try {
    res.json({ status: "success", data: { user: sanitizeUser(req.user) } });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateUserProfile(req.user.id, req.body);
    res.json({ status: "success", data: { user: updated } });
  } catch (err) {
    next(err);
  }
}

async function listAddresses(req, res, next) {
  try {
    const addresses = await userService.listAddresses(req.user.id);
    res.json({ status: "success", data: addresses });
  } catch (err) {
    next(err);
  }
}

async function createAddress(req, res, next) {
  try {
    const address = await userService.createAddress(req.user.id, req.body);
    res.status(201).json({ status: "success", data: address });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json({ status: "success", data: users });
  } catch (err) {
    next(err);
  }
}

async function changeUserStatus(req, res, next) {
  try {
    const user = await userService.changeUserStatus(
      req.params.id,
      req.body.status,
    );
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "User not found." });
    res.json({ status: "success", data: { user: sanitizeUser(user) } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  listAddresses,
  createAddress,
  listUsers,
  changeUserStatus,
};
