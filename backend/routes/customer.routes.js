const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    logoutCustomer,
    changePassword
} = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public Routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected Routes (uses protect middleware)
router.get('/me', protect, getCustomerProfile);
router.post('/logout', protect, logoutCustomer);
router.patch('/change-password', protect, changePassword);

module.exports = router;