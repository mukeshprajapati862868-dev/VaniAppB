// const mongoose = require('mongoose');

// /**
//  * Model: Cart
//  * Represents a user's shopping cart.
//  */
// const ObjectId = mongoose.Schema.Types.ObjectId;

// const cartSchema = new mongoose.Schema({
//   userId: { type: ObjectId, ref: 'User', required: true, unique: true },
//   items: [{ productId: { type: ObjectId, ref: 'Product' }, title: String, price: Number, quantity: Number, image: String }],
//   subtotal: Number,
//   discountAmount: Number,
//   deliveryCharge: Number,
//   gstAmount: Number,
//   grandTotal: Number,
// }, { timestamps: true });

// module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

