// src/pages/Orders.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getMyOrders();
            setOrders(data.orders);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please login to view your orders');
            } else {
                setError("Something went wrong. We couldn't load your orders.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Status badge colors
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
                <div className="text-xl text-gray-600">Loading your orders...</div>
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
                    <button
                        onClick={fetchOrders}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ---------- EMPTY ----------
    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-7xl mb-6">📦</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        You have not placed any orders yet
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Once you place an order, it will show up here.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // ---------- SUCCESS ----------
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">My Orders</h1>
                    <p className="text-gray-600">
                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                        >
                            {/* Header */}
                            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-mono break-all">
                                        Order #{order._id}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="space-y-1 mb-4">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="text-gray-800 font-medium">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-xs text-gray-500 italic">
                                        + {order.items.length - 3} more item
                                        {order.items.length - 3 !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {/* Total + Actions */}
                            <div className="border-t pt-4 flex flex-wrap justify-between items-center gap-3">
                                <div>
                                    <span className="text-gray-500 text-sm">Total</span>
                                    <span className="ml-2 text-xl font-bold text-gray-900">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <Link
                                    to={`/orders/${order._id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;