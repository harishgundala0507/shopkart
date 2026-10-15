// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Navbar from './components/Navbar';
import { getCurrentUser } from './services/api';
import { CartProvider } from './context/CartContext';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await getCurrentUser();
                setIsLoggedIn(true);
            } catch (error) {
                setIsLoggedIn(false);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading ShopKart...</div>
            </div>
        );
    }

    return (
        <Router>
            <CartProvider isLoggedIn={isLoggedIn}>
                <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to={isLoggedIn ? '/home' : '/login'} replace />}
                    />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/login"
                        element={<Login setIsLoggedIn={setIsLoggedIn} />}
                    />
                    <Route
                        path="/home"
                        element={
                            isLoggedIn ? <Home /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route
                        path="/wishlist"
                        element={
                            isLoggedIn ? <Wishlist /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            isLoggedIn ? <Cart /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            isLoggedIn ? <Checkout /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/order-success/:id"
                        element={
                            isLoggedIn ? <OrderSuccess /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            isLoggedIn ? <Orders /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/orders/:id"
                        element={
                            isLoggedIn ? <OrderDetails /> : <Navigate to="/login" replace />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </CartProvider>
        </Router>
    );
}

export default App;