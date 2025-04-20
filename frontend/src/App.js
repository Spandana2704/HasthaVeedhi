// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CustomerMapPage from './pages/MapPage';
import SellerDashboard from './pages/SellerPage';
import ShopPage from "./pages/ShopPage";
import MapPage from "./pages/MapPage";
import WishlistPage from "./pages/Wishlist";
import CartPage from "./pages/MyCart";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customer-map" element={<CustomerMapPage />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default App;
