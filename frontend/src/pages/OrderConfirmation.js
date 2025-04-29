import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderConfirmation.css';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <h1>Thank You for Your Order!</h1>
          <p>Your order has been placed successfully.</p>
        </div>
        
        <div className="order-details">
          <h2>Order Summary</h2>
          <div className="detail-row">
            <span>Order Number:</span>
            <span>{order._id}</span>
          </div>
          <div className="detail-row">
            <span>Order Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{order.payment.method}</span>
          </div>
          <div className="detail-row">
            <span>Payment Status:</span>
            <span className={`status-${order.payment.status.toLowerCase()}`}>
              {order.payment.status}
            </span>
          </div>
          <div className="detail-row">
            <span>Estimated Delivery:</span>
            <span>
              {order.estimatedDelivery 
                ? new Date(order.estimatedDelivery).toLocaleDateString()
                : 'Calculating...'}
            </span>
          </div>
        </div>
        
        <div className="shipping-details">
          <h2>Shipping Information</h2>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p>{order.shippingAddress.addressLine2}</p>
          )}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>
        
        <div className="confirmation-actions">
          <button 
            onClick={() => navigate('/orders')}
            className="view-orders-btn"
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="continue-shopping-btn"
          >
            Explore Crafts
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;