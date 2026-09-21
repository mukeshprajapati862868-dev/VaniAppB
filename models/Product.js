const mongoose = require('mongoose');

/**
 * Model: Product
 * Stores product/service catalog items.
 */
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: Number,
  category: String,
  stock: { type: Number, default: 0 },
  image: String,
  rating: Number,
  reviews: Number,
  brand: String,
  sku: String,
  features: [String],
  specifications: Object,
  deliveryInfo: String,
  returnPolicy: String,
  warranty: String,
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
