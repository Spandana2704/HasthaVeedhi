// controllers/productController.js
const Product = require('../models/Product');

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    console.log("Update request for product ID:", id);  // DEBUG
    console.log("Update data:", req.body);              // DEBUG
  
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ product: updatedProduct });
      } catch (err) {
        res.status(500).json({ message: 'Failed to update product', error: err.message });
      }
    };

    exports.addProduct = async (req, res) => {
      try {
        const product = new Product({
          ...req.body,
          sellerId: req.user.id,
          imageUrl: req.body.imageUrl.replace('http://localhost:5000', '') // Store relative path
        });
        
        await product.validate(); // Explicit validation
        await product.save();
        
        res.status(201).json({ 
          success: true, 
          product: {
            ...product.toObject(),
            imageUrl: `http://localhost:5000${product.imageUrl}`
          }
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error.message,
          validationErrors: error.errors 
        });
      }
    };


        exports.getSellerProducts = async (req, res) => {
          try {
            const products = await Product.find({ sellerId: req.user._id });
            res.status(200).json({ success: true, products });
          } catch (err) {
            res.status(500).json({ success: false, error: err.message });
          }
        };

// Add this to your controllers/productController.js
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};        
        