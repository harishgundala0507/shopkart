const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

// @desc    Register a new customer
// @route   POST /customers/register
const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Validation: Check if all fields are present
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Please fill all fields' });
        }

        // Validation: Check password length
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Check if customer already exists
        const customerExists = await Customer.findOne({ email });
        if (customerExists) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create customer
        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        if (customer) {
            res.status(201).json({
                success: true,
                message: 'Customer registered successfully',
                customer: {
                    _id: customer._id,
                    fullName: customer.fullName,
                    email: customer.email,
                    phone: customer.phone
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid customer data' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login customer
// @route   POST /customers/login
const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find customer by email
        const customer = await Customer.findOne({ email });

        // Check if customer exists and password matches
        if (customer && (await bcrypt.compare(password, customer.password))) {
            
            // Generate token and set cookie
            const token = generateToken(customer._id);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(200).json({
                success: true,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged-in customer profile
// @route   GET /customers/me
const getCustomerProfile = async (req, res) => {
    try {
        // The customer is attached to req.user by the auth middleware
        const customer = await Customer.findById(req.user._id).select('-password');
        
        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Logout customer
// @route   POST /customers/logout
const logoutCustomer = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Change Customer Password
// @route   PATCH /customers/change-password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Find the logged-in customer by ID
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify if the old password matches the one in the DB
        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Old password is incorrect' });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        // Hash the new password and save it
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(newPassword, salt);
        await customer.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    logoutCustomer,
    changePassword
};