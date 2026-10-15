// controllers/wishlist.controller.js

const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// ---------- ADD PRODUCT TO WISHLIST ----------
// POST /wishlist/:productId
// Protected — req.user is set by authMiddleware
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // 1. Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Check product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 3. Get the authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Check if product is already in wishlist
        const alreadyInWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyInWishlist) {
            return res.status(409).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // 5. Add product reference and save
        user.wishlist.push(productId);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        next(error);
    }
};

// ---------- GET CURRENT USER'S WISHLIST ----------
// GET /wishlist
// Protected
const getWishlist = async (req, res, next) => {
    try {
        // Find user and populate wishlist references with product details
        const user = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock description'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
};

// ---------- REMOVE PRODUCT FROM WISHLIST ----------
// DELETE /wishlist/:productId
// Protected
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Get the authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Check if product is actually in wishlist
        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in wishlist'
            });
        }

        // 4. Remove the reference
        user.wishlist.splice(index, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};