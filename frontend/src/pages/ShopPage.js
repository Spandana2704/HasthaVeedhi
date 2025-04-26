import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import '../styles/ShopPage.css';

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const craft = new URLSearchParams(location.search).get('craft');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = craft 
          ? `http://localhost:5000/api/products/craft/${encodeURIComponent(craft)}`
          : 'http://localhost:5000/api/products';

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [craft]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Products</h2>
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
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>{craft ? `${craft} Products` : 'All Products'}</h2>

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
                  <button className="add-to-cart">Add to Cart</button>
                  <FaHeart
                    className="wishlist-icon-inline"
                    color={wishlist[product._id] ? 'red' : 'gray'}
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