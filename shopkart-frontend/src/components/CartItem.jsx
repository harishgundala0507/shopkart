// src/components/CartItem.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();

    const [updating, setUpdating] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState('');

    const { product, quantity } = item;
    const lineTotal = product.price * quantity;
    const maxReached = quantity >= product.stock;

    // Increase quantity by 1
    const handleIncrease = async () => {
        if (updating || maxReached) return;

        setUpdating(true);
        setError('');

        const result = await updateQuantity(product._id, quantity + 1);

        if (!result.success) {
            setError(result.message);
        }

        setUpdating(false);
    };

    // Decrease quantity by 1
    const handleDecrease = async () => {
        if (updating || quantity <= 1) return;

        setUpdating(true);
        setError('');

        const result = await updateQuantity(product._id, quantity - 1);

        if (!result.success) {
            setError(result.message);
        }

        setUpdating(false);
    };

    // Remove item from cart
    const handleRemove = async () => {
        if (removing) return;

        setRemoving(true);
        setError('');

        const result = await removeItem(product._id);

        if (!result.success) {
            setError(result.message);
            setRemoving(false);
        }
        // on success, the parent removes this component from the DOM
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
            {/* Image */}
            <div className="w-full sm:w-32 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase">
                            {product.category}
                        </p>
                        <Link
                            to={`/products/${product._id}`}
                            className="text-lg font-bold text-gray-800 hover:text-blue-600"
                        >
                            {product.name}
                        </Link>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                    {product.stock < 10 ? `Only ${product.stock} left in stock` : `${product.stock} in stock`}
                </p>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-600 mb-2">{error}</p>
                )}

                {/* Quantity + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-300 rounded">
                        <button
                            onClick={handleDecrease}
                            disabled={updating || quantity <= 1}
                            className={`w-9 h-9 flex items-center justify-center text-lg font-bold ${
                                quantity <= 1 || updating
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            −
                        </button>
                        <span className="w-10 text-center font-semibold">
                            {updating ? '...' : quantity}
                        </span>
                        <button
                            onClick={handleIncrease}
                            disabled={updating || maxReached}
                            className={`w-9 h-9 flex items-center justify-center text-lg font-bold ${
                                maxReached || updating
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            +
                        </button>
                    </div>

                    {/* Line total */}
                    <p className="text-lg font-bold text-gray-900">
                        ₹{lineTotal.toLocaleString('en-IN')}
                    </p>

                    {/* Remove */}
                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className={`text-sm font-medium px-3 py-1 rounded ${
                            removing
                                ? 'text-gray-400 cursor-wait'
                                : 'text-red-600 hover:bg-red-50'
                        }`}
                    >
                        {removing ? 'Removing...' : '🗑️ Remove'}
                    </button>
                </div>

                {/* Info when max reached */}
                {maxReached && !updating && (
                    <p className="text-xs text-orange-600 mt-1">
                        Maximum available stock reached
                    </p>
                )}
            </div>
        </div>
    );
};

export default CartItem;