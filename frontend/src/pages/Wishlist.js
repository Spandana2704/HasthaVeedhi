import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import '../styles/ShopPage.css';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/products/wishlist', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setWishlistProducts(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const toggleWishlist = async (productId) => {
    try {
      const response = await fetch('http://localhost:5000/api/products/wishlist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setWishlistProducts(prev => prev.filter(product => product._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Wishlist</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <header className="shop-header">
        <h1>CraftShop</h1>
        <nav>
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Back
          </button>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/shop')}>ShopPage</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>Your Wishlist</h2>

      <div className="products-grid">
        {wishlistProducts.length > 0 ? (
          wishlistProducts.map((product) => {
            const discountedPrice = product.price * (1 - (product.discount/100));
            return (
              <div key={product._id} className="product-card">
                <img
                  src={product.imageUrl ? 
                    `http://localhost:5000${product.imageUrl}` : 
                    '/fallback-image.jpg'}
                  alt={product.name || "Product"}
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                <h3>{product.name || 'Unnamed Product'}</h3>
                <p className="craft-type">{product.craft || 'Unknown Craft'}</p>
                
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

                <p className={`availability ${product.availability ? 'in-stock' : 'out-of-stock'}`}>
                  {product.availability ? 'In Stock' : 'Out of Stock'}
                </p>

                <div className="product-actions">
                  <button className="buy-now">Buy Now</button>
                  <button className="add-to-cart">Add to Cart</button>
                  <FaHeart
                    className="wishlist-icon-inline"
                    color="red"
                    size={30}
                    onClick={() => toggleWishlist(product._id)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-products-message">
            Your wishlist is empty
          </p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;