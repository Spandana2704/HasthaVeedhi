import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import '../styles/ShopPage.css';

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState([]); // Now an array of product IDs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const craft = new URLSearchParams(location.search).get('craft');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch products
        const url = craft 
          ? `http://localhost:5000/api/products/craft/${encodeURIComponent(craft)}`
          : 'http://localhost:5000/api/products';

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // No wishlist for guests
        
        const response = await fetch('http://localhost:5000/api/products/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const wishlistData = await response.json();
          setWishlist(wishlistData.map(product => product._id));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [craft]);

  const toggleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth'); // Redirect to login if not authenticated
        return;
      }

      const isWishlisted = wishlist.includes(productId);
      const url = `http://localhost:5000/api/products/wishlist/${isWishlisted ? 'remove' : 'add'}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setWishlist(prev => 
          isWishlisted 
            ? prev.filter(id => id !== productId) // Remove if already wishlisted
            : [...prev, productId] // Add if not wishlisted
        );
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };
  // Add this function to your ShopPage component
  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
  
      // Debugging logs
      console.log('Attempting to add product to cart:', productId);
      
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
  
      // Debugging the raw response
      const responseText = await response.text();
      console.log('Raw server response:', responseText);
  
      if (!response.ok) {
        // Try to parse error message
        let errorMessage = 'Failed to add to cart';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
  
      // Success case
      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Product added to cart:', responseData);
      
      // Optional: Update local state or trigger refresh
      // fetchCartItems(); // Uncomment if you want to refresh cart immediately
      
      // User feedback
      alert('Product added to cart successfully!');
      
    } catch (error) {
      console.error('Cart operation failed:', {
        error: error.message,
        stack: error.stack
      });
      
      // More user-friendly error messages
      const userMessage = error.message.includes('token')
        ? 'Please login to add items to cart'
        : error.message.includes('network')
        ? 'Network error - please check your connection'
        : 'Failed to add item to cart';
        
      alert(userMessage);
    }
  };;





  return (
    <div className="shop-page">
      <header className="shop-header">
        <h1>CraftShop</h1>
        <nav>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>{craft ? `${craft} Products` : 'All Products'}</h2>

      {error && (
        <div className="error-message">
          Error loading products: {error}
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
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
                  <button 
                     className="add-to-cart" 
                      onClick={() => handleAddToCart(product._id)}
                                     >
                          Add to Cart
                  </button>
                  <FaHeart
                    className="wishlist-icon-inline"
                    color={wishlist.includes(product._id) ? 'red' : 'gray'}
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
            {loading ? 'Loading...' : 'No products found'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShopPage;