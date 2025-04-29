import React, { useState } from 'react';
import '../styles/PayPalMock.css';

const PayPalMock = ({ amount, onSuccess, onCancel }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!credentials.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      onSuccess({
        transactionId: `PAYPAL-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        status: 'Completed'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="paypal-container">
      <div className="paypal-header">
        <div className="paypal-logo">
          <span className="paypal-blue">Pay</span>
          <span className="paypal-yellow">Pal</span>
        </div>
        <div className="paypal-subheader">The safer, easier way to pay</div>
      </div>

      <div className="paypal-amount-container">
        <div className="paypal-amount-label">Amount to pay:</div>
        <div className="paypal-amount">₹{amount.toFixed(2)}</div>
      </div>

      <form onSubmit={handleSubmit} className="paypal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="paypal@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="paypal-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="paypal-cancel-btn"
          >
            Cancel Payment
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="paypal-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>

        <div className="paypal-security">
          <div className="security-lock">🔒</div>
          <div className="security-text">
            Your financial information is encrypted and secure
          </div>
        </div>
      </form>

      <div className="paypal-footer">
        <div className="disclaimer">
          This is a simulated PayPal payment. No real money will be transferred.
        </div>
      </div>
    </div>
  );
};

export default PayPalMock;