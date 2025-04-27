// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ArtisanMarketMap from './pages/MapPage';
import SellerDashboard from './pages/SellerPage';
import ShopPage from "./pages/ShopPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import Wishlist from "./pages/Wishlist";
import CartPage from './pages/CartPage';
// import CheckoutPage from './pages/CheckoutPage';
// import OrderConfirmation from './pages/OrderConfirmation';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customer-map" element={<ArtisanMarketMap />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/map" element={<ArtisanMarketMap />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/cart" element={<CartPage />} />
      {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
      {/* <Route path="/order-confirmation" element={<OrderConfirmation />} />       */}
    </Routes>
  );
};

export default App;