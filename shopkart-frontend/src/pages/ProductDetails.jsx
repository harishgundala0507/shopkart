// src/pages/ProductDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    // Extract :id from URL
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState('');

    // Check if product is already in cart
    const isInCart = cartItems.some(
        (item) => item.product?._id === product?._id
    );

    // Handle Add to Cart
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

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getProductById(id);
                setProduct(data.product);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Product not found');
                } else if (err.response?.status === 400) {
                    setError('Invalid product ID');
                } else {
                    setError('Something went wrong. Please try again.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading product...</div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <p className="text-xl text-red-600 font-semibold mb-4">
                        {error}
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    >
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    // Not supposed to happen but just in case
    if (!product) return null;

    // Stock badge
    const stockBadge = () => {
        if (product.stock === 0) {
            return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Out of Stock</span>;
        }
        if (product.stock < 10) {
            return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">Only {product.stock} left</span>;
        }
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">In Stock ({product.stock})</span>;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
                >
                    ← Back
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Image side */}
                        <div className="bg-gray-50 flex items-center justify-center p-8">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="max-h-96 w-full object-contain"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                                }}
                            />
                        </div>

                        {/* Info side */}
                        <div className="p-8 flex flex-col">
                            <p className="text-sm text-blue-600 font-semibold uppercase mb-2">
                                {product.category}
                            </p>
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                {product.name}
                            </h1>

                            <div className="mb-4">{stockBadge()}</div>

                            <p className="text-4xl font-bold text-gray-900 mb-6">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>

                            <div className="border-t pt-4 mb-6">
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                    Description
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-auto space-y-2">
                                {cartError && (
                                    <p className="text-sm text-red-600 text-center">{cartError}</p>
                                )}

                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    className={`w-full py-3 rounded font-semibold transition ${
                                        product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : addingToCart
                                            ? 'bg-orange-300 text-white cursor-wait'
                                            : isInCart
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    {product.stock === 0
                                        ? 'Out of Stock'
                                        : addingToCart
                                        ? 'Adding...'
                                        : isInCart
                                        ? '🛒 Add Another'
                                        : '🛒 Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;