// routes/order.routes.js

const express = require('express');
const router = express.Router();

const {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getSingleOrder
} = require('../controllers/order.controller');

// Import auth middleware (named export)
const { protect } = require('../middlewares/auth.middleware');

// ---------- ORDER ROUTES ----------
// All routes are protected — user must be logged in

// POST /orders/create-payment-order → validate cart + create pending order
router.post('/create-payment-order', protect, createPaymentOrder);

// POST /orders/verify-payment → confirm payment (mock) + clear cart
router.post('/verify-payment', protect, verifyPayment);

// GET /orders → list current user's orders
router.get('/', protect, getMyOrders);

// GET /orders/:id → get one order (with ownership check)
router.get('/:id', protect, getSingleOrder);

module.exports = router;