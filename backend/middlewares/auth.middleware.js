const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find customer by ID and exclude password
        const customer = await Customer.findById(decoded.id).select('-password');

        if (!customer) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        // Attach customer to request object
        req.user = customer;
        next();

    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };