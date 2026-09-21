const express = require("express");
const { query } = require("express-validator");
const Product = require("../models/Product");

const router = express.Router();

/**
 * ==========================================
 * GET ALL PRODUCTS
 * GET /api/products
 * GET /api/products?q=phone
 * GET /api/products?category=electronics
 * ==========================================
 */
router.get(
  "/",
  [query("q").optional().trim(), query("category").optional().trim()],
  async (req, res) => {
    try {
      const { q, category } = req.query;

      let filter = {};

      if (category) {
        filter.category = category;
      }

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ];
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/**
 * ==========================================
 * GET PRODUCTS BY CATEGORY
 * GET /api/products/category/:categoryId
 * ==========================================
 */
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * ==========================================
 * SEARCH PRODUCTS
 * GET /api/products/search?q=mobile
 * ==========================================
 */
router.get(
  "/search",
  [query("q").isString().notEmpty().withMessage("Search string is required.")],
  async (req, res) => {
    try {
      const search = req.query.q;

      const products = await Product.find({
        $or: [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: search,
              $options: "i",
            },
          },
          {
            category: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/**
 * ==========================================
 * GET PRODUCT BY ID
 * GET /api/products/:id
 * ==========================================
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
