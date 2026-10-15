// routes/cart.routes.js

const express = require('express');
const router = express.Router();

const {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart
} = require('../controllers/cart.controller');

// Import auth middleware (named export)
const { protect } = require('../middlewares/auth.middleware');

// ---------- CART ROUTES ----------
// All routes are protected — user must be logged in

// POST /cart/:productId → add product or increment quantity
router.post('/:productId', protect, addToCart);

// GET /cart → get current user's cart
router.get('/', protect, getCart);

// PATCH /cart/:productId → update quantity
router.patch('/:productId', protect, updateQuantity);

// DELETE /cart/:productId → remove product from cart
router.delete('/:productId', protect, removeFromCart);

module.exports = router;