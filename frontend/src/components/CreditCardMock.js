import React, { useState } from 'react';
import '../styles/CreditCardMock.css';

const CreditCardMock = ({ amount, onSuccess, onCancel }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const validateCard = () => {
    // Simple validation
    if (!cardData.number.match(/^\d{16}$/)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardData.name.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!cardData.expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter expiry in MM/YY format');
      return false;
    }
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateCard()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      onSuccess({
        transactionId: `CC-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        status: 'Completed'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="credit-card-container">
      <div className="card-preview">
        <div className="card-front">
          <div className="card-logo">VISA</div>
          <div className="card-number">
            {cardData.number || '•••• •••• •••• ••••'}
          </div>
          <div className="card-details">
            <div className="card-name">
              {cardData.name || 'CARDHOLDER NAME'}
            </div>
            <div className="card-expiry">
              {cardData.expiry || 'MM/YY'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            name="number"
            value={cardData.number}
            onChange={handleChange}
            placeholder="4242 4242 4242 4242"
            maxLength="16"
          />
        </div>

        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            name="name"
            value={cardData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="text"
              name="expiry"
              value={cardData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength="5"
            />
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              name="cvv"
              value={cardData.cvv}
              onChange={handleChange}
              placeholder="123"
              maxLength="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              `Pay ₹${amount.toFixed(2)}`
            )}
          </button>
        </div>

        <div className="disclaimer">
          <i className="fas fa-lock"></i> This is a simulated payment. No real money will be transferred.
        </div>
      </form>
    </div>
  );
};

export default CreditCardMock;