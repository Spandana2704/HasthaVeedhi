import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GiftAssistant.css';

const GiftAssistantPage = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your gift assistant. How can I help you today? Ask me about gift recommendations or craft details.", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
      setProducts(data.products || []);
      
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages(prev => [...prev, { 
        text: err.message || "Sorry, I'm having trouble. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add to cart');
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message);
    }
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue');
      navigate('/auth');
      return;
    }

    if (!product.availability) {
      alert('Product is out of stock');
      return;
    }

    navigate('/checkout', {
      state: {
        directProduct: product,
        quantity: 1
      }
    });
  };

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <nav className="assistant-nav">
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button 
            onClick={() => navigate('/auth')} 
            className="logout-btn"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="assistant-title">
        <h1>🎁 Gift Assistant</h1>
        <p>Ask me for gift recommendations or craft information</p>
      </div>

      <div className="assistant-layout">
        {/* Chat Section */}
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.isBot ? 'bot' : 'user'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question here..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Products Section */}
        <div className="products-section">
          {products.length > 0 ? (
            <>
              <h3>Recommended Products</h3>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <img 
                      src={product.imageUrl || '/placeholder.jpg'} 
                      alt={product.name} 
                    />
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="craft">{product.craft}</p>
                      <p className="price">₹{product.price}</p>
                      <p className={`stock ${product.availability ? 'in' : 'out'}`}>
                        {product.availability ? 'In Stock' : 'Out of Stock'}
                      </p>
                      <div className="actions">
                        <button 
                          onClick={() => handleBuyNow(product)}
                          disabled={!product.availability}
                        >
                          Buy Now
                        </button>
                        <button 
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!product.availability}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Ask about products to see recommendations here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftAssistantPage;