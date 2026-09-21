// const cartService = require('../services/cartService');

// /**
//  * Controller: cartController
//  *
//  * Routes:
//  * GET /api/cart
//  * POST /api/cart/items
//  * PUT /api/cart/items/:id
//  * DELETE /api/cart/items/:id
//  * DELETE /api/cart
//  *
//  * Purpose: HTTP handlers for cart operations. Delegates business logic to `services/cartService`.
//  */

// async function getCart(req, res, next) {
//   try {
//     const cart = await cartService.getCart(req.user.id);
//     res.json({ status: 'success', data: cart });
//   } catch (err) {
//     next(err);
//   }
// }

// async function addItem(req, res, next) {
//   try {
//     const updated = await cartService.addItemToCart(req.user.id, req.body);
//     res.status(201).json({ status: 'success', data: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// async function updateItem(req, res, next) {
//   try {
//     const quantity = Number(req.body.quantity || 0);
//     const updated = await cartService.updateCartItem(req.user.id, req.params.id, quantity);
//     res.json({ status: 'success', data: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// async function removeItem(req, res, next) {
//   try {
//     const updated = await cartService.removeCartItem(req.user.id, req.params.id);
//     res.json({ status: 'success', data: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// async function clearCart(req, res, next) {
//   try {
//     const updated = await cartService.clearCart(req.user.id);
//     res.json({ status: 'success', data: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = {
//   getCart,
//   addItem,
//   updateItem,
//   removeItem,
//   clearCart,
// };

