// src/components/SearchBar.jsx

const SearchBar = ({ search, setSearch, category, setCategory, sort, setSort }) => {
    // Predefined categories matching our products
    const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Category dropdown */}
            <div className="md:w-48">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat === 'All' ? '' : cat}>
                            {cat === 'All' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sort dropdown */}
            <div className="md:w-48">
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">Sort: Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
};

export default SearchBar;