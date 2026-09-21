const User = require("../models/User");

async function listAddresses(userId) {
  const user = await User.findById(userId).select("addresses");
  if (!user) throw new Error("User not found");
  return user.addresses;
}

async function createAddress(userId, addressData) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.addresses.push(addressData);
  await user.save();
  return user.addresses[user.addresses.length - 1];
}

async function listUsers() {
  return await User.find({}).select("-passwordHash -refreshTokens");
}

async function changeUserStatus(userId, status) {
  return await User.findByIdAndUpdate(userId, { status }, { new: true }).select(
    "-passwordHash -refreshTokens",
  );
}

module.exports = {
  listAddresses,
  createAddress,
  listUsers,
  changeUserStatus,
};
