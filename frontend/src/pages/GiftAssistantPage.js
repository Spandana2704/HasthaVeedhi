import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GiftAssistant.css';

const GiftAssistantPage = () => {
  const [occasion, setOccasion] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!occasion) {
        setProducts([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/products/gift-assistant/${occasion}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching gift suggestions:', err);
      }
    };

    fetchSuggestions();
  }, [occasion]);

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
    <div className="gift-assistant-page">
      {/* Navbar */}
      <header className="gift-assistant-navbar">
        <nav>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <div className="gift-assistant-header">
        <h1>🎁 Gift Assistant</h1>
        <p>Select an occasion to see gift ideas</p>
      </div>

      <label htmlFor="occasion-select" className="gift-assistant-label">Choose an Occasion:</label>
      <select
        id="occasion-select"
        value={occasion}
        onChange={(e) => setOccasion(e.target.value)}
        className="gift-assistant-select"
      >
        <option value="">-- Select --</option>
        <option value="wedding">Wedding</option>
        <option value="birthday">Birthday</option>
        <option value="housewarming">Housewarming</option>
        <option value="babyShower">Baby Shower</option>
        <option value="engagement">Engagement</option>
        <option value="retirement">Retirement</option>
      </select>

      <div className="gift-assistant-products-grid">
        {products.map((product) => (
          <div key={product._id} className="gift-assistant-product-card">
            <img
              src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : '/fallback-image.jpg'}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            <p>{product.craft}</p>
            <p>₹{product.price}</p>
            <p className={product.availability ? 'gift-assistant-in-stock' : 'gift-assistant-out-of-stock'}>
              {product.availability ? 'In Stock' : 'Out of Stock'}
            </p>

            <div className="gift-assistant-product-actions">
              <button
                className="gift-assistant-buy-now"
                onClick={() => handleBuyNow(product)}
                disabled={!product.availability}
              >
                Buy Now
              </button>
              <button
                className="gift-assistant-add-to-cart"
                onClick={() => handleAddToCart(product._id)}
                disabled={!product.availability}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftAssistantPage;
