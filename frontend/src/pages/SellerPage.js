import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SellerPage.css';

const craftNames = [
  "Ajrakh Block Printing", "Apatani Weaving", "Aranmula Kannadi", "Bandhani",
  "Banarasi Silk Sarees", "Bastar Iron Craft", "Blue Pottery", "Chamba Rumal",
  "Chanderi Sarees", "Chikankari", "Coir Products", "Dharmavaram Silk Sarees",
  "Gadwal Sarees", "Gollabhama Sarees", "Godna Art", "Kantha Stitch", "Kondapalli Toys",
  "Kondagaon", "Madhubani Painting", "Maheshwari Sarees", "Manipuri Dance Costumes",
  "Mangalagiri Sarees", "Muga Silk Weaving", "Naga Shawls", "Nirmal Paintings", "Pattachitra",
  "Pashmina Shawls", "Pembarthi Brassware", "Phad Painting", "Phulkari Embroidery", "Pochampally sarees",
  "Risa and Rignai Weaving", "Shell Craft", "Tanjore Paintings", "Terracotta Craft", "Thangka Paintings",
  "Uppada Jamdani Sarees", "Venkatagiri Sarees", "Warli Painting"
];
const SellerDashboard = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    craft: '',
    availability: true,
    imageUrl: '',
  });

  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
const [editProductData, setEditProductData] = useState({ availability: true, discount: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('http://localhost:5000/api/products');
        setProducts(productsResponse.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:5000/api/upload/image', formData);
        const imageUrl = response.data.imageUrl;
        setNewProduct((prev) => ({ ...prev, imageUrl }));
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/products/add', newProduct);
      setProducts([...products, response.data.product]);
      alert('Product added successfully!');
      setNewProduct({ name: '', price: '', craft: '', availability: true, imageUrl: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${updatedProduct._id}`,
        updatedProduct
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? response.data.product : p))
      );
      alert('Product updated successfully!');
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };
  
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Seller Dashboard</h2>
        <button onClick={() => setShowAddForm(true)}>Add to Products</button>
      </div>
      <div className="dashboard-content">
      <h3>Existing Products</h3>
      {products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <p>No image available</p>
              )}
              <div>
                <h4>{product.name}</h4>
                <p>{product.craft}</p>
                <p>{`Price: ₹${product.price}`}</p>
              {/* Availability Toggle */}
      <label>
      {editProductId === product._id ? (
  <>
    <label>
      Availability:
      <select
        value={editProductData.availability}
        onChange={(e) =>
          setEditProductData((prev) => ({
            ...prev,
            availability: e.target.value === 'true'
          }))
        }
      >
        <option value="true">Available</option>
        <option value="false">Out of Stock</option>
      </select>
    </label>

    <label>
      Discount (%):
      <input
        type="number"
        value={editProductData.discount}
        min="0"
        max="100"
        onChange={(e) =>
          setEditProductData((prev) => ({
            ...prev,
            discount: parseInt(e.target.value)
          }))
        }
      />
    </label>

    <button
      onClick={() => {
        handleUpdateProduct({ ...product, ...editProductData });
        setEditProductId(null);
      }}
    >
      Save
    </button>
    <button onClick={() => setEditProductId(null)}>Cancel</button>
  </>
) : (
  <>
    <p>Availability: {product.availability ? 'Available' : 'Out of Stock'}</p>
    <p>Discount: {product.discount || 0}%</p>
    <button
      onClick={() => {
        setEditProductId(product._id);
        setEditProductData({
          availability: product.availability,
          discount: product.discount || 0
        });
      }}
    >
      Edit
    </button>
  </>
)}
</label>
                <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
              </div>
            </div>
            
          ))}
        
        </div>
      )}
      </div>
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            <form className="product-form" onSubmit={handleAddProduct}>
              <h3>Add a New Product</h3>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="price"
                placeholder="Price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
              <select
                name="craft"
                value={newProduct.craft}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Craft</option>
                {craftNames.map((craft, index) => (
                  <option key={index} value={craft}>
                    {craft}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {newProduct.imageUrl && <img src={newProduct.imageUrl} alt="Preview" />}
              <button type="submit">Add Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
