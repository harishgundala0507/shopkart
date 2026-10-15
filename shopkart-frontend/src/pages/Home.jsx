// src/pages/Home.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch current user on component mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                setUser(data);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading your profile...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome, {user?.fullName}! 🎉
                    </h1>
                    <p className="text-blue-100">
                        You are successfully logged in to ShopKart
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                        Your Profile
                    </h2>

                    <div className="space-y-6">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Full Name</p>
                                <p className="text-xl font-semibold text-gray-800">
                                    {user?.fullName}
                                </p>
                            </div>
                        </div>

                        {/* Email + Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <p className="text-gray-500 text-sm mb-1">📧 Email</p>
                                <p className="text-lg font-medium break-all text-gray-800">
                                    {user?.email}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <p className="text-gray-500 text-sm mb-1">📱 Phone</p>
                                <p className="text-lg font-medium text-gray-800">
                                    {user?.phone}
                                </p>
                            </div>
                        </div>

                        {/* Customer ID */}
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <p className="text-gray-500 text-sm mb-1">🆔 Customer ID</p>
                            <p className="text-sm font-mono text-gray-700 break-all">
                                {user?._id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to="/products"
                        className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition cursor-pointer"
                    >
                        <div className="text-4xl mb-2">🛍️</div>
                        <h3 className="font-bold text-gray-700">Browse Products</h3>
                        <p className="text-gray-500 text-sm">Explore our catalog</p>
                    </Link>

                    <Link
                        to="/cart"
                        className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition cursor-pointer"
                    >
                        <div className="text-4xl mb-2">🛒</div>
                        <h3 className="font-bold text-gray-700">Shopping Cart</h3>
                        <p className="text-gray-500 text-sm">View your cart items</p>
                    </Link>

                    <Link
                        to="/wishlist"
                        className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition cursor-pointer"
                    >
                        <div className="text-4xl mb-2">❤️</div>
                        <h3 className="font-bold text-gray-700">My Wishlist</h3>
                        <p className="text-gray-500 text-sm">Your saved products</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;