// src/pages/OrderDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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

    // Status badge styling
    const statusColor = (status) => {
        switch (status) {
            case 'PLACED':      return 'bg-blue-100 text-blue-700';
            case 'CONFIRMED':   return 'bg-purple-100 text-purple-700';
            case 'SHIPPED':     return 'bg-yellow-100 text-yellow-700';
            case 'DELIVERED':   return 'bg-green-100 text-green-700';
            default:            return 'bg-gray-100 text-gray-700';
        }
    };

    // ---------- LOADING ----------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading order...</div>
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
                        Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) return null;

    // ---------- SUCCESS ----------
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-4xl">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
                >
                    ← Back
                </button>

                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Order Details
                            </h1>
                            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                                #{order._id}
                            </p>
                        </div>
                        <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${statusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium text-gray-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Payment Status</p>
                            <p className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                {order.paymentStatus}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Items</p>
                            <p className="font-medium text-gray-800">{order.items.length}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-bold text-gray-900 text-lg">
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                Items
                            </h2>

                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                                    >
                                        {/* Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                                }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex justify-between">
                                            <div>
                                                <Link
                                                    to={`/products/${item.product}`}
                                                    className="font-semibold text-gray-800 hover:text-blue-600"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-bold text-gray-900">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total row */}
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">Total</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Shipping address */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                Shipping Address
                            </h2>

                            <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                                <p className="font-semibold text-gray-800">
                                    {order.shippingAddress.fullName}
                                </p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                </p>
                                <p>PIN: {order.shippingAddress.pincode}</p>
                                <p className="pt-2">📱 {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/orders"
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                    >
                        Back to My Orders
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

export default OrderDetails;