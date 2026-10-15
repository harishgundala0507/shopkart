// src/pages/OrderSuccess.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getOrderById(id);
                setOrder(data.order);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Order not found');
                } else if (err.response?.status === 403) {
                    setError('You are not allowed to view this order');
                } else if (err.response?.status === 400) {
                    setError('Invalid order ID');
                } else {
                    setError('Failed to load order. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    // ---------- LOADING ----------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading order details...</div>
            </div>
        );
    }

    // ---------- ERROR ----------
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-xl text-red-600 font-semibold mb-4">{error}</p>
                    <Link
                        to="/orders"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    // ---------- SUCCESS ----------
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Success Banner */}
                <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600">
                        Your order has been saved successfully.
                    </p>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                        Order Details
                    </h2>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono text-gray-800 text-right break-all ml-4">
                                {order._id}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="font-semibold text-green-600">
                                {order.status}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment</span>
                            <span className="font-semibold text-green-600">
                                {order.paymentStatus}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="text-gray-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="font-semibold text-gray-700 mb-3">
                            Items ({order.items.length})
                        </h3>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between text-sm"
                                >
                                    <span className="text-gray-700">
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-gray-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="font-semibold text-gray-700 mb-2">
                            Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.addressLine1}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                            📱 {order.shippingAddress.phone}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/orders"
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/products"
                        className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;