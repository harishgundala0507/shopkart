// src/components/WishlistCard.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../services/api';

const WishlistCard = ({ product, onRemoved }) => {
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState('');

    const handleRemove = async () => {
        if (removing) return; // prevent double-clicks

        setRemoving(true);
        setError('');

        try {
            await removeFromWishlist(product._id);
            // Notify parent so it removes the card from the list
            if (onRemoved) onRemoved(product._id);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please login first');
            } else {
                setError('Unable to remove. Try again.');
            }
            setRemoving(false);
        }
    };

    // Stock status
    const stockStatus = () => {
        if (product.stock === 0) {
            return { text: 'Out of stock', color: 'text-red-600' };
        }
        if (product.stock < 10) {
            return { text: `Only ${product.stock} left`, color: 'text-orange-600' };
        }
        return { text: `${product.stock} in stock`, color: 'text-green-600' };
    };

    const stock = stockStatus();

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
            {/* Image */}
            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                />
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                    {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                    ₹{product.price.toLocaleString('en-IN')}
                </p>
                <p className={`text-sm font-medium mb-4 ${stock.color}`}>
                    {stock.text}
                </p>

                {error && (
                    <p className="text-xs text-red-600 mb-2">{error}</p>
                )}

                {/* Buttons */}
                <div className="mt-auto space-y-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                        View Details
                    </Link>

                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className={`w-full py-2 rounded font-semibold transition ${
                            removing
                                ? 'bg-gray-200 text-gray-500 cursor-wait'
                                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                        }`}
                    >
                        {removing ? '⏳ Removing...' : '♥ Remove from Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;