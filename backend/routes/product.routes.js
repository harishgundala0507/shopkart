// routes/product.routes.js

const express = require('express');
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getSingleProduct
} = require('../controllers/product.controller');

// ---------- PRODUCT ROUTES ----------

// POST /products → create a new product
router.post('/', createProduct);

// GET /products → get all products (supports ?search=&category=&sort=)
router.get('/', getAllProducts);

// GET /products/:id → get a single product by ID
router.get('/:id', getSingleProduct);

module.exports = router;