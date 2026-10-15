// controllers/order.controller.js

const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const razorpay = require('../config/razorpay');

// ---------- CREATE PAYMENT ORDER ----------
// POST /orders/create-payment-order
// Validates cart, creates pending ShopKart order, creates Razorpay Order
const createPaymentOrder = async (req, res, next) => {
    try {
        const { shippingAddress } = req.body;

        // 1. Validate shipping address
        const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
        for (const field of requiredFields) {
            if (!shippingAddress?.[field]?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Shipping address field "${field}" is required`
                });
            }
        }

        if (!/^[0-9]{10}$/.test(shippingAddress.phone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be 10 digits'
            });
        }

        if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Pincode must be 6 digits'
            });
        }

        // 2. Load user cart with populated products
        const user = await Customer.findById(req.user._id).populate('cart.product');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 3. Reject empty cart
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // 4. Re-verify each product's existence + stock, build snapshot, calculate total
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of user.cart) {
            const product = await Product.findById(cartItem.product._id);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${cartItem.product.name}" is no longer available`
                });
            }

            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            totalAmount += product.price * cartItem.quantity;
        }

        // 5. Create pending ShopKart order first
        const order = await Order.create({
            user: user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT'
        });

        // 6. Create Razorpay order
        //    Amount must be in paise (smallest INR unit). ₹1 = 100 paise.
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: order._id.toString(),
            notes: {
                shopKartOrderId: order._id.toString(),
                userId: user._id.toString()
            }
        });

        // 7. Save Razorpay order ID on our order
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // 8. Return checkout data (Key ID only — never the secret!)
        res.status(201).json({
            success: true,
            message: 'Order created. Complete payment to confirm.',
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        next(error);
    }
};

// ---------- VERIFY PAYMENT ----------
// POST /orders/verify-payment
// Verifies Razorpay HMAC SHA256 signature, marks order PAID, clears cart
const verifyPayment = async (req, res, next) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Validate input
        if (!shopKartOrderId || !mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid shopKartOrderId is required'
            });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing Razorpay verification fields'
            });
        }

        // 2. Find the order (and ensure ownership)
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.paymentStatus === 'PAID') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }

        // 3. Verify Razorpay Order ID matches what we stored
        //    Prevents attacker from pairing a different Razorpay order with this ShopKart order
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay order ID mismatch'
            });
        }

        // 4. Compute expected HMAC SHA256 signature
        //    body = razorpay_order_id + "|" + razorpay_payment_id
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        // 5. Compare — timing-safe comparison
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // 6. Signature valid → mark order as PAID + PLACED
        order.paymentStatus = 'PAID';
        order.status = 'PLACED';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // 7. Decrement product stock for each item
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // 8. Clear the user's cart
        await Customer.findByIdAndUpdate(req.user._id, { cart: [] });

        res.status(200).json({
            success: true,
            message: 'Payment verified and order placed',
            order
        });
    } catch (error) {
        next(error);
    }
};

// ---------- GET CURRENT USER'S ORDERS ----------
// GET /orders
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
};

// ---------- GET SINGLE ORDER ----------
// GET /orders/:id
const getSingleOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to view this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getSingleOrder
};