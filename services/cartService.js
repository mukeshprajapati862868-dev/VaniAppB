// const Cart = require("../models/Cart");
// const Product = require("../models/Product");

// /**
//  * Get Cart
//  */
// async function getCart(userId) {
//   let cart = await Cart.findOne({ userId }).populate("items.productId");

//   if (!cart) {
//     cart = await Cart.create({
//       userId,
//       items: [],
//       subtotal: 0,
//       discountAmount: 0,
//       deliveryCharge: 0,
//       gstAmount: 0,
//       grandTotal: 0,
//     });
//   }

//   return cart;
// }

// /**
//  * Calculate Totals
//  */
// function calculateTotals(cart) {
//   let subtotal = 0;

//   cart.items.forEach((item) => {
//     subtotal += Number(item.price) * Number(item.quantity);
//   });

//   cart.subtotal = subtotal;
//   cart.discountAmount = 0;
//   cart.deliveryCharge = subtotal > 500 ? 0 : 50;
//   cart.gstAmount = Number((subtotal * 18) / 100);

//   cart.grandTotal =
//     cart.subtotal - cart.discountAmount + cart.deliveryCharge + cart.gstAmount;
// }

// /**
//  * Add Item To Cart
//  */
// async function addItemToCart(userId, body) {
//   const { productId, quantity = 1 } = body;

//   const product = await Product.findById(productId);

//   if (!product) {
//     throw {
//       statusCode: 404,
//       message: "Product not found",
//     };
//   }

//   let cart = await Cart.findOne({ userId });

//   if (!cart) {
//     cart = new Cart({
//       userId,
//       items: [],
//     });
//   }

//   const existingItem = cart.items.find(
//     (item) => item.productId.toString() === productId,
//   );

//   if (existingItem) {
//     existingItem.quantity += Number(quantity);
//   } else {
//     cart.items.push({
//       productId: product._id,
//       title: product.title,
//       price: product.offerPrice || product.price,
//       quantity: Number(quantity),
//       image: product.image,
//     });
//   }

//   calculateTotals(cart);

//   await cart.save();

//   return await Cart.findById(cart._id).populate("items.productId");
// }

// /**
//  * Update Cart Item
//  */
// async function updateCartItem(userId, itemId, quantity) {
//   const cart = await Cart.findOne({ userId });

//   if (!cart) {
//     throw {
//       statusCode: 404,
//       message: "Cart not found",
//     };
//   }

//   // Match Cart Item ID OR Product ID
//   const item = cart.items.find(
//     (item) =>
//       item._id.toString() === itemId || item.productId.toString() === itemId,
//   );

//   if (!item) {
//     throw {
//       statusCode: 404,
//       message: "Cart Item not found",
//     };
//   }

//   if (Number(quantity) <= 0) {
//     cart.items = cart.items.filter(
//       (item) =>
//         item._id.toString() !== itemId && item.productId.toString() !== itemId,
//     );
//   } else {
//     item.quantity = Number(quantity);
//   }

//   calculateTotals(cart);

//   await cart.save();

//   return await Cart.findById(cart._id).populate("items.productId");
// }

// /**
//  * Remove Item
//  */
// async function removeCartItem(userId, itemId) {
//   const cart = await Cart.findOne({ userId });

//   if (!cart) {
//     throw {
//       statusCode: 404,
//       message: "Cart not found",
//     };
//   }

//   cart.items = cart.items.filter(
//     (item) =>
//       item._id.toString() !== itemId && item.productId.toString() !== itemId,
//   );

//   calculateTotals(cart);

//   await cart.save();

//   return await Cart.findById(cart._id).populate("items.productId");
// }

// /**
//  * Clear Cart
//  */
// async function clearCart(userId) {
//   const cart = await Cart.findOne({ userId });

//   if (!cart) {
//     throw {
//       statusCode: 404,
//       message: "Cart not found",
//     };
//   }

//   cart.items = [];

//   calculateTotals(cart);

//   await cart.save();

//   return cart;
// }

// module.exports = {
//   getCart,
//   addItemToCart,
//   updateCartItem,
//   removeCartItem,
//   clearCart,
// };
