// routes/wishlist.routes.js

const express = require('express');
const router = express.Router();

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require('../controllers/wishlist.controller');

// Import auth middleware (named export)
const { protect } = require('../middlewares/auth.middleware');

// ---------- WISHLIST ROUTES ----------
// All routes are protected — user must be logged in

// POST /wishlist/:productId → add product to wishlist
router.post('/:productId', protect, addToWishlist);

// GET /wishlist → get current user's wishlist
router.get('/', protect, getWishlist);

// DELETE /wishlist/:productId → remove product from wishlist
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;