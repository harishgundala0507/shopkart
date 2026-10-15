// src/pages/Cart.jsx

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, loading, error, subtotal, cartCount, fetchCart } = useCart();

    // ---------- LOADING ----------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading your cart...</div>
            </div>
        );
    }

    // ---------- ERROR ----------
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-xl text-red-600 font-semibold mb-4">
                        {error}
                    </p>
                    <button
                        onClick={fetchCart}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ---------- EMPTY ----------
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-7xl mb-6">🛒</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded transition"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    // ---------- SUCCESS ----------
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        My Cart
                    </h1>
                    <p className="text-gray-600">
                        {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <CartItem key={item.product._id} item={item} />
                        ))}
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items</span>
                                    <span>{cartCount}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <div className="border-t pt-3 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{subtotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to="/products"
                                className="block text-center text-blue-600 hover:underline text-sm mt-4"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;