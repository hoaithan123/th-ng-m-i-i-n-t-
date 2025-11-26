import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import CustomCombo from './pages/CustomCombo';
import Account from './pages/Account';
import { cartAPI } from './utils/api';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await cartAPI.getCart();
      const data = response.data || {};
      const products = Array.isArray(data.products) ? data.products : [];
      const combos = Array.isArray(data.combos) ? data.combos : [];
      const total = [
        ...products.map((item) => Number(item.so_luong || 0)),
        ...combos.map((item) => Number(item.so_luong || 0))
      ].reduce((sum, qty) => sum + qty, 0);
      setCartCount(total);
    } catch (error) {
      console.error('Không thể tải số lượng giỏ hàng:', error);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const handleLogout = () => {
    setCartCount(0);
  };

  return (
    <div className="App">
      <Header cartCount={cartCount} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home onCartUpdate={refreshCartCount} />} />
          <Route path="/products" element={<ProductList onCartUpdate={refreshCartCount} />} />
          <Route path="/products/:id" element={<ProductDetail onCartUpdate={refreshCartCount} />} />
          <Route path="/cart" element={<Cart onCartUpdate={refreshCartCount} />} />
          <Route path="/checkout" element={<Checkout onCartUpdate={refreshCartCount} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/custom-combo" element={<CustomCombo onCartUpdate={refreshCartCount} />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/profile" element={<Navigate to="/account?tab=profile" replace />} />
          <Route path="/account/addresses" element={<Navigate to="/account?tab=addresses" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
