const mongoose = require('mongoose');

/**
 * Model: Address
 * User-saved addresses for checkout and profile.
 */
const ObjectId = mongoose.Schema.Types.ObjectId;

const addressSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  houseNo: String,
  landmark: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Address || mongoose.model('Address', addressSchema);
