// controllers/productController.js
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');

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

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [productId]
      });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } }
    );

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    
    res.status(200).json(wishlist ? wishlist.products : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};