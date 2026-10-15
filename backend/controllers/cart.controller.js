// controllers/cart.controller.js

const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// ---------- ADD PRODUCT TO CART ----------
// POST /cart/:productId
// If product not in cart → add with quantity 1
// If product already in cart → increment quantity by 1
const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Find product (need its stock for validation)
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 3. Load authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Check if product is already in cart
        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            // 4a. Already in cart → try to increment
            const newQuantity = existingItem.quantity + 1;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available in stock`
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            // 4b. Not in cart → add with quantity 1 (check stock > 0)
            if (product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is out of stock'
                });
            }

            user.cart.push({
                product: productId,
                quantity: 1
            });
        }

        // 5. Save
        await user.save();

        // 6. Return updated cart (populated)
        await user.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        res.status(201).json({
            success: true,
            message: 'Cart updated',
            cart: user.cart
        });
    } catch (error) {
        next(error);
    }
};

// ---------- GET CURRENT USER'S CART ----------
// GET /cart
const getCart = async (req, res, next) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
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
            cart: user.cart
        });
    } catch (error) {
        next(error);
    }
};

// ---------- UPDATE QUANTITY ----------
// PATCH /cart/:productId
// Body: { quantity: 3 }
const updateQuantity = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Validate quantity
        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a number of at least 1'
            });
        }

        // 3. Find product for stock check
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 4. Load user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 5. Find the cart item
        const cartItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        // 6. Stock validation
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available in stock`
            });
        }

        // 7. Update quantity
        cartItem.quantity = quantity;
        await user.save();

        // 8. Return updated cart
        await user.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: user.cart
        });
    } catch (error) {
        next(error);
    }
};

// ---------- REMOVE PRODUCT FROM CART ----------
// DELETE /cart/:productId
const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // 2. Load user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Find index of item in cart
        const index = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        // 4. Remove
        user.cart.splice(index, 1);
        await user.save();

        // 5. Return updated cart
        await user.populate({
            path: 'cart.product',
            select: 'name price category image stock description'
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart: user.cart
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart
};