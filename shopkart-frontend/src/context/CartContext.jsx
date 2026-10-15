// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getCart,
    addToCart as addToCartAPI,
    updateCartQuantity as updateQuantityAPI,
    removeFromCart as removeFromCartAPI
} from '../services/api';

// Create the context
const CartContext = createContext(null);

// Provider component — wraps the app and provides cart state to all children
export const CartProvider = ({ children, isLoggedIn }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ---------- FETCH CART FROM BACKEND ----------
    const fetchCart = useCallback(async () => {
        // Only fetch if user is logged in
        if (!isLoggedIn) {
            setCartItems([]);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await getCart();
            setCartItems(data.cart);
        } catch (err) {
            if (err.response?.status === 401) {
                setCartItems([]);
            } else {
                setError('Unable to load your cart');
            }
            console.error('Cart fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch cart whenever login state changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ---------- ADD TO CART ----------
    const addToCart = async (productId) => {
        try {
            const data = await addToCartAPI(productId);
            setCartItems(data.cart);       // update global state from backend response
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to add to cart';
            return { success: false, message };
        }
    };

    // ---------- UPDATE QUANTITY ----------
    const updateQuantity = async (productId, quantity) => {
        try {
            const data = await updateQuantityAPI(productId, quantity);
            setCartItems(data.cart);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to update quantity';
            return { success: false, message };
        }
    };

    // ---------- REMOVE FROM CART ----------
    const removeItem = async (productId) => {
        try {
            const data = await removeFromCartAPI(productId);
            setCartItems(data.cart);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to remove item';
            return { success: false, message };
        }
    };

    // ---------- CLEAR CART LOCALLY ----------
    // Used after successful order — backend already cleared the cart,
    // so we just sync frontend state without another API call.
    const clearCartLocal = () => {
        setCartItems([]);
    };

    // ---------- DERIVED VALUES ----------

    // Total number of units (for navbar badge)
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Subtotal in rupees
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    // ---------- PROVIDE TO CHILDREN ----------
    const value = {
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCartLocal
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook for consuming the context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
};