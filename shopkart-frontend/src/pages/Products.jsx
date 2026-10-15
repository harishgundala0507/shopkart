// src/pages/Products.jsx

import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search + filter + sort state
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('');

    // Fetch products whenever search, category, or sort changes
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                // Build params object - only include non-empty values
                const params = {};
                if (search) params.search = search;
                if (category) params.category = category;
                if (sort) params.sort = sort;

                const data = await getProducts(params);
                setProducts(data.products);
            } catch (err) {
                setError('Something went wrong while loading products.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce: wait 300ms after user stops typing before fetching
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [search, category, sort]);

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🛍️ Shop Products
                </h1>

                {/* Search + Category + Sort */}
                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    sort={sort}
                    setSort={setSort}
                />

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="text-xl text-gray-600">
                            Loading products...
                        </div>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-xl text-gray-600">No products found.</p>
                        <p className="text-gray-500 mt-2">
                            Try a different search or category.
                        </p>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && !error && products.length > 0 && (
                    <>
                        <p className="text-gray-600 mb-4">
                            {products.length} product{products.length !== 1 ? 's' : ''} found
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;