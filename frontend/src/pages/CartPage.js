import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/auth');
            return;
          }
      
          console.log('Fetching cart items...');
          
          const response = await fetch('http://localhost:5000/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      
          const responseText = await response.text();
          console.log('Raw cart response:', responseText);
      
          if (!response.ok) {
            let errorMessage = 'Failed to load cart';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
          }
      
          const cartData = responseText ? JSON.parse(responseText) : [];
          console.log('Cart items loaded:', cartData);
          
          setCartItems(Array.isArray(cartData) ? cartData : []);
          
        } catch (error) {
          console.error('Cart fetch error:', {
            error: error.message,
            stack: error.stack
          });
          
          setError(error.message);
          
          // Auto-retry for network errors
          if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
            console.log('Retrying cart fetch...');
            setTimeout(fetchCartItems, 2000);
          }
        } finally {
          setLoading(false);
        }
      };

    fetchCartItems();
  }, [navigate]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      if (!response.ok) throw new Error('Failed to update quantity');
      
      // Refresh cart items
      const updatedResponse = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setCartItems(updatedData);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.message);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) throw new Error('Failed to remove item');
      
      // Refresh cart items
      const updatedResponse = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setCartItems(updatedData);
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.productId.price * (1 - (item.productId.discount / 100));
      return total + (discountedPrice * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>CraftShop</h1>
        <nav>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>Your Shopping Cart</h2>

      {error && (
        <div className="error-message">
          Error loading cart: {error}
        </div>
      )}

      <div className="cart-container">
        {loading ? (
          <p>Loading your cart...</p>
        ) : cartItems.length > 0 ? (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const product = item.productId;
                const discountedPrice = product.price * (1 - (product.discount / 100));
                
                return (
                  <div key={product._id} className="cart-item">
                    <img
                      src={product.imageUrl ? 
                        `http://localhost:5000${product.imageUrl}` : 
                        '/fallback-image.jpg'}
                      alt={product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{product.name}</h3>
                      <p className="craft-type">{product.craft}</p>
                      
                      <div className="price-container">
                        {product.discount > 0 ? (
                          <>
                            <span className="original-price">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span className="discounted-price">
                              ₹{discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                            <span className="discount-badge">
                              {product.discount}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="price">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        className="remove-item"
                        onClick={() => removeItem(product._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <button 
                className="checkout-button"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/shop')}>Continue Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;