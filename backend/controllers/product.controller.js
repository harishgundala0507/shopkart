// controllers/product.controller.js

const Product = require('../models/product.model');
const mongoose = require('mongoose');

// ---------- CREATE PRODUCT ----------
// POST /products
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Basic validation
        if (!name || !description || !price || !category || !image || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, description, price, category, image, stock'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative'
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        next(error);
    }
};

// ---------- GET ALL PRODUCTS (with search, filter, sort) ----------
// GET /products
// GET /products?search=keyboard
// GET /products?category=Electronics
// GET /products?search=keyboard&category=Electronics
// GET /products?sort=price_asc
const getAllProducts = async (req, res, next) => {
    try {
        const { search, category, sort } = req.query;

        // Build filter object dynamically
        const filter = {};

        // If search provided, match against name (case-insensitive)
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
            // $regex = pattern match
            // $options: 'i' = case-insensitive
        }

        // If category provided, exact match
        if (category) {
            filter.category = category;
        }

        // Build sort object
        let sortOption = {};
        if (sort === 'price_asc') {
            sortOption.price = 1;
        } else if (sort === 'price_desc') {
            sortOption.price = -1;
        } else {
            sortOption.createdAt = -1; // default: newest first
        }

        const products = await Product.find(filter).sort(sortOption);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
};

// ---------- GET SINGLE PRODUCT ----------
// GET /products/:id
const getSingleProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct
};