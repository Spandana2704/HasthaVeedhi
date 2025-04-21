const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Product = require('../models/Product');
const productController = require('../controllers/productController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images'); // Save uploaded images to 'uploads/images' folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as file name
    },
  });
  
  const upload = multer({ storage });

// POST: Add a new product
router.post('/add', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const imageUrl = `/uploads/images/${req.file.filename}`; // Construct the image URL
      res.status(200).json({ imageUrl });
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload image', message: err.message });
    }
  });

// GET: Get products by craft
router.get('/', async (req, res) => {
  const { craft } = req.query;
  try {
    const products = craft
      ? await Product.find({ craft: new RegExp(craft, 'i') })
      : await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});



module.exports = router;