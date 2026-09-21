const { validationResult } = require('express-validator');
const productService = require('../services/productService');

/**
 * Controller: productController
 *
 * Routes: GET /api/products, GET /api/products/:id, GET /api/products/search, GET /api/products/category/:categoryId
 * Purpose: Thin HTTP handlers delegating to productService.
 */

async function list(req, res, next) {
  try {
    const { q, category } = req.query;
    const items = await productService.listProducts({ q, category });
    res.json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

async function byCategory(req, res, next) {
  try {
    const items = await productService.listByCategory(req.params.categoryId);
    res.json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
    const items = await productService.searchProducts(req.query.q);
    res.json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found.' });
    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, byCategory, search, getById };
