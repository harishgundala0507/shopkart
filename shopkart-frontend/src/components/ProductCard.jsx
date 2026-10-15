// src/components/ProductCard.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlisted = false, onWishlistChange }) => {
    const { addToCart, cartItems } = useCart();

    const [saving, setSaving] = useState(false);          // wishlist saving
    const [added, setAdded] = useState(isWishlisted);
    const [wishlistError, setWishlistError] = useState('');

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState('');

    // Check if this product is already in the cart
    const isInCart = cartItems.some(
        (item) => item.product?._id === product._id
    );

    // Stock status display
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

    // ---------- WISHLIST ----------
    const handleAddToWishlist = async () => {
        if (saving || added) return;
        setSaving(true);
        setWishlistError('');

        try {
            await addToWishlist(product._id);
            setAdded(true);
            if (onWishlistChange) onWishlistChange(product._id, true);
        } catch (err) {
            if (err.response?.status === 409) {
                setAdded(true);
                if (onWishlistChange) onWishlistChange(product._id, true);
            } else if (err.response?.status === 401) {
                setWishlistError('Please login to save items');
            } else {
                setWishlistError('Unable to save. Try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    // ---------- CART ----------
    const handleAddToCart = async () => {
        if (addingToCart) return;
        setAddingToCart(true);
        setCartError('');

        const result = await addToCart(product._id);

        if (!result.success) {
            setCartError(result.message);
        }

        setAddingToCart(false);
    };

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

                {/* Wishlist error */}
                {wishlistError && (
                    <p className="text-xs text-red-600 mb-2">{wishlistError}</p>
                )}

                {/* Cart error */}
                {cartError && (
                    <p className="text-xs text-red-600 mb-2">{cartError}</p>
                )}

                {/* Buttons */}
                <div className="mt-auto space-y-2">
                    <Link
                        to={`/products/${product._id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                        View Details
                    </Link>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock === 0}
                        className={`w-full py-2 rounded font-semibold transition ${
                            product.stock === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : addingToCart
                                ? 'bg-orange-300 text-white cursor-wait'
                                : isInCart
                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {product.stock === 0
                            ? 'Out of Stock'
                            : addingToCart
                            ? 'Adding...'
                            : isInCart
                            ? 'Add Another'
                            : '🛒 Add to Cart'}
                    </button>

                    {/* Wishlist toggle */}
                    <button
                        onClick={handleAddToWishlist}
                        disabled={saving || added}
                        className={`w-full py-2 rounded font-semibold transition ${
                            added
                                ? 'bg-red-100 text-red-600 cursor-default'
                                : saving
                                ? 'bg-gray-200 text-gray-500 cursor-wait'
                                : 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-300'
                        }`}
                    >
                        {saving
                            ? '⏳ Saving...'
                            : added
                            ? '♥ Added to Wishlist'
                            : '♡ Add to Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;