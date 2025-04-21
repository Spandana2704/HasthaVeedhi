// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ArtisanMarketMap from './pages/MapPage';
import SellerDashboard from './pages/SellerPage';
import ShopPage from "./pages/ShopPage";
import WishlistPage from "./pages/Wishlist";
import CartPage from "./pages/MyCart";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customer-map" element={<ArtisanMarketMap />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/map" element={<ArtisanMarketMap />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default App;
