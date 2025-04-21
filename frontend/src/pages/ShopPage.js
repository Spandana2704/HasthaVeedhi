import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import '../styles/ShopPage.css';

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState({}); // Track wishlist status

  const craft = new URLSearchParams(location.search).get('craft');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products${craft ? `?craft=${craft}` : ''}`);
        const data = await res.json();
        console.log('Fetched Product Data:', data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching products:', error);
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

  return (
    <div className="shop-page">
      {/* Header */}
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
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              
              <img
                src={product.imageUrl}
                alt={product.name || "Product"}
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
              <p className="discount">{product.discount}% OFF</p>
              <p className={`availability ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                     {product.availability? 'In Stock' : 'Out of Stock'}
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
          ))
        ) : (
          <p className="no-products-message">No products found for this craft.</p>
        )}
      </div>
    </div>
  );
};

export default ShopPage;


