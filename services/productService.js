const {
  ensureSeedData,
  listProducts,
  getProductById,
  searchProducts,
  listProductsByCategory,
} = require("../utils/storage");

/**
 * Service: productService
 *
 * Purpose: Encapsulate product retrieval logic so controllers remain thin.
 */

async function getProducts({ q, category } = {}) {
  await ensureSeedData();
  return listProducts({ q, category });
}

async function getProduct(id) {
  await ensureSeedData();
  return getProductById(id);
}

async function searchProduct(q) {
  await ensureSeedData();
  return searchProducts(q);
}

async function listByCategory(categoryId) {
  await ensureSeedData();
  return listProductsByCategory(categoryId);
}

module.exports = {
  listProducts: getProducts,
  getProductById: getProduct,
  searchProducts: searchProduct,
  listByCategory,
};
