// src/components/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const { cartCount } = useCart();

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoggedIn(false);
            navigate('/login');
        }
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold hover:text-blue-200">
                    🛒 ShopKart
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/products"
                        className="hover:text-blue-200 transition"
                    >
                        Products
                    </Link>

                    {isLoggedIn && (
                        <>
                            <Link
                                to="/wishlist"
                                className="hover:text-blue-200 transition"
                            >
                                Wishlist
                            </Link>

                            {/* Cart with count badge */}
                            <Link
                                to="/cart"
                                className="hover:text-blue-200 transition relative"
                            >
                                Cart
                                {cartCount > 0 && (
                                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Orders link */}
                            <Link
                                to="/orders"
                                className="hover:text-blue-200 transition"
                            >
                                Orders
                            </Link>

                            <Link
                                to="/home"
                                className="hover:text-blue-200 transition"
                            >
                                Home
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition font-medium"
                            >
                                Logout
                            </button>
                        </>
                    )}

                    {!isLoggedIn && (
                        <>
                            <Link
                                to="/login"
                                className="hover:text-blue-200 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition font-medium"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;