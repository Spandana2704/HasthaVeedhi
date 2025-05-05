// controllers/productController.js
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');

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
          imageUrl: req.body.imageUrl.startsWith('/uploads') ? req.body.imageUrl : `/uploads/images/${req.body.imageUrl}` // Store relative path
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
// Add to cart
// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ productId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(item => 
        item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId })
      .populate('items.productId');

    if (!cart) {
      return res.status(200).json([]);
    }

    res.status(200).json(cart.items);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOneAndUpdate(
      { 
        user: userId,
        'items.productId': productId
      },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get cart
// In controllers/productController.js

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ user: userId });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};