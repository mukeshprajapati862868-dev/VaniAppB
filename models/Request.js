const mongoose = require('mongoose');

/**
 * Model: Request
 * Stores support/pending requests submitted by users.
 */
const ObjectId = mongoose.Schema.Types.ObjectId;

const requestSchema = new mongoose.Schema({
  requester: { type: ObjectId, ref: 'User' },
  type: String,
  summary: String,
  email: String,
  phone: String,
  location: String,
  priority: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);
