// src/services/api.js
// Centralized API configuration for ShopKart backend

import axios from 'axios';

// Create axios instance with base URL and default settings
const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true, // CRITICAL: sends cookies (JWT) with every request
    headers: {
        'Content-Type': 'application/json'
    }
});

// ---------- API FUNCTIONS ----------

// Register a new customer
export const registerCustomer = async (customerData) => {
    const response = await api.post('/customers/register', customerData);
    return response.data;
};

// Login customer
export const loginCustomer = async (credentials) => {
    const response = await api.post('/customers/login', credentials);
    return response.data;
};

// Get current user profile (protected route)
export const getCurrentUser = async () => {
    const response = await api.get('/customers/me');
    return response.data;
};

// Logout customer
export const logoutCustomer = async () => {
    const response = await api.post('/customers/logout');
    return response.data;
};

// ---------- PRODUCT API FUNCTIONS ----------

// Get all products (with optional search, category, sort)
export const getProducts = async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
};

// Get single product by ID
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};
// ---------- WISHLIST API FUNCTIONS ----------

// Add a product to wishlist
export const addToWishlist = async (productId) => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
};

// Get current user's wishlist
export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

// Remove a product from wishlist
export const removeFromWishlist = async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
};

// ---------- CART API FUNCTIONS ----------

// Add product to cart (or increment quantity if already there)
export const addToCart = async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    return response.data;
};

// Get current user's cart
export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

// Update quantity of a specific cart item
export const updateCartQuantity = async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data;
};

// Remove product from cart
export const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
};

// ---------- ORDER API FUNCTIONS ----------

// Create a payment order (pending ShopKart order)
export const createPaymentOrder = async (shippingAddress) => {
    const response = await api.post('/orders/create-payment-order', { shippingAddress });
    return response.data;
};

// Verify payment — sends Razorpay signature data for server-side verification
export const verifyPayment = async (paymentData) => {
    const response = await api.post('/orders/verify-payment', paymentData);
    return response.data;
};

// Get current user's orders
export const getMyOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

// Get single order
export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};
export default api;