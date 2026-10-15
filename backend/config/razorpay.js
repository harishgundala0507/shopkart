// config/razorpay.js

const Razorpay = require('razorpay');

// Initialize Razorpay client with test-mode credentials from .env
// The keys are read from process.env (loaded by dotenv in index.js)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;