const mongoose = require('mongoose');

/**
 * Model: Category
 * Stores product category metadata used in the catalog.
 */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: String,
  description: String,
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
