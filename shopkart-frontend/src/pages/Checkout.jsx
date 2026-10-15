// src/pages/Checkout.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

// Load Razorpay's Checkout script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, subtotal, cartCount, clearCartLocal } = useCart();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [error, setError] = useState('');
    const [placing, setPlacing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (cartItems.length === 0 && !placing) {
            navigate('/cart');
        }
    }, [cartItems, placing, navigate]);

    const handleChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const validateForm = () => {
        const fields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

        for (const field of fields) {
            if (!shippingAddress[field].trim()) {
                return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
            }
        }

        if (!/^[0-9]{10}$/.test(shippingAddress.phone)) {
            return 'Phone number must be exactly 10 digits';
        }

        if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
            return 'Pincode must be exactly 6 digits';
        }

        return null;
    };

    // ---------- PLACE ORDER + OPEN RAZORPAY CHECKOUT ----------
    const handlePlaceOrder = async () => {
        setError('');
        setStatusMessage('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setPlacing(true);
        setStatusMessage('Preparing your order...');

        try {
            // Step 1: Load Razorpay Checkout script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Check your internet connection.');
                setPlacing(false);
                setStatusMessage('');
                return;
            }

            // Step 2: Create pending ShopKart order + Razorpay order
            setStatusMessage('Creating payment order...');
            const createRes = await createPaymentOrder(shippingAddress);

            if (!createRes.success) {
                setError(createRes.message || 'Failed to create order');
                setPlacing(false);
                setStatusMessage('');
                return;
            }

            // Step 3: Open Razorpay Checkout modal
            setStatusMessage('Opening payment gateway...');

            const options = {
                key: createRes.key,
                amount: createRes.amount,
                currency: createRes.currency,
                name: 'ShopKart',
                description: 'ShopKart Order',
                order_id: createRes.razorpayOrderId,

                // Called by Razorpay after user completes payment.
                // We then forward to our backend for signature verification.
                handler: async function (response) {
                    try {
                        setStatusMessage('Verifying payment...');

                        const verifyRes = await verifyPayment({
                            shopKartOrderId: createRes.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (!verifyRes.success) {
                            setError(verifyRes.message || 'Payment verification failed');
                            setPlacing(false);
                            setStatusMessage('');
                            return;
                        }

                        // Success
                        clearCartLocal();
                        navigate(`/order-success/${verifyRes.order._id}`);
                    } catch (err) {
                        const msg = err.response?.data?.message || 'Verification failed';
                        setError(msg);
                        setPlacing(false);
                        setStatusMessage('');
                    }
                },

                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone
                },

                theme: {
                    color: '#2563eb'
                },

                modal: {
                    ondismiss: function () {
                        // User closed the Razorpay modal without paying
                        setPlacing(false);
                        setStatusMessage('');
                        setError('Payment cancelled. Your cart has not been cleared.');
                    }
                }
            };

            const razorpayModal = new window.Razorpay(options);

            razorpayModal.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setError(
                    `Payment failed: ${response.error?.description || 'Please try again.'}`
                );
                setPlacing(false);
                setStatusMessage('');
            });

            razorpayModal.open();
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(message);
            setPlacing(false);
            setStatusMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {statusMessage && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                        {statusMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Shipping Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                Shipping Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={shippingAddress.fullName}
                                        onChange={handleChange}
                                        placeholder="Harish Gundala"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleChange}
                                        maxLength={10}
                                        placeholder="9876543210"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={shippingAddress.addressLine1}
                                        onChange={handleChange}
                                        placeholder="22 MG Road, Apt 4B"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleChange}
                                            placeholder="Bengaluru"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleChange}
                                            placeholder="Karnataka"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={shippingAddress.pincode}
                                            onChange={handleChange}
                                            maxLength={6}
                                            placeholder="560001"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.product._id}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-700 truncate mr-2">
                                            {item.product.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-800 flex-shrink-0">
                                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 mb-6">
                                <div className="flex justify-between text-gray-600 mb-2">
                                    <span>Items</span>
                                    <span>{cartCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{subtotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded transition disabled:bg-green-300"
                            >
                                {placing ? 'Processing...' : '💳 Pay & Place Order'}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-2">
                                Secured by Razorpay (Test Mode)
                            </p>

                            <Link
                                to="/cart"
                                className="block text-center text-blue-600 hover:underline text-sm mt-4"
                            >
                                ← Back to Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;