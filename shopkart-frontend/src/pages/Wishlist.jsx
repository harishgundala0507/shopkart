// src/pages/Wishlist.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWishlist = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getWishlist();
            setWishlist(data.wishlist);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please login to view your wishlist');
            } else {
                setError("Something went wrong. We couldn't load your wishlist.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    // Handle removal — update local state without re-fetching
    const handleRemoved = (removedId) => {
        setWishlist((prev) => prev.filter((p) => p._id !== removedId));
    };

    // ---------- LOADING ----------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading your wishlist...</div>
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
                        onClick={fetchWishlist}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ---------- EMPTY ----------
    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-7xl mb-6">❤️</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Your wishlist is empty
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Save products you love and find them here later.
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
            <div className="container mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        My Wishlist
                    </h1>
                    <p className="text-gray-600">
                        {wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <WishlistCard
                            key={product._id}
                            product={product}
                            onRemoved={handleRemoved}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;