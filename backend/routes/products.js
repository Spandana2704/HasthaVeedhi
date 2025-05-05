const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Product = require('../models/Product');
const productController = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/images');
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// POST: Add a new product
router.post('/add', protect, productController.addProduct);

// Image upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Image upload failed',
      message: err.message 
    });
  }
});

// GET: Get all products (public access)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      error: err.message 
    });
  }
});

// GET: Get products by craft type (public access)
router.get('/craft/:craftType', async (req, res) => {
  try {
    const products = await Product.find({ 
      craft: req.params.craftType 
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by craft',
      error: err.message
    });
  }
});

// GET: Get seller's products (protected)
router.get('/my-products', protect, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
});

// DELETE: Delete a product by ID (protected)
router.delete('/:id', protect, productController.deleteProduct);

// PUT: Update a product (protected)
router.put('/:id', protect, productController.updateProduct);

// GET: Get seller products (protected)
router.get('/seller', protect, productController.getSellerProducts);

router.post('/wishlist/add', protect, productController.addToWishlist);
router.post('/wishlist/remove', protect, productController.removeFromWishlist);
router.get('/wishlist', protect, productController.getWishlist);

const occasionMap = {
  wedding: [
    "Ajrakh Block Printing", "Banarasi Silk Sarees", "Bandhani", "Chanderi Sarees",
    "Dharmavaram Silk Sarees", "Gadwal Sarees", "Gollabhama Sarees", "Kantha Stitch",
    "Maheshwari Sarees", "Mangalagiri Sarees", "Muga Silk Weaving", "Pochampally sarees",
    "Uppada Jamdani Sarees", "Venkatagiri Sarees", "Pashmina Shawls", "Naga Shawls"
  ],
  birthday: [
    "Kondapalli Toys", "Blue Pottery", "Chamba Rumal", "Chikankari", "Godna Art",
    "Madhubani Painting", "Phad Painting", "Phulkari Embroidery", "Shell Craft",
    "Terracotta Craft", "Warli Painting"
  ],
  housewarming: [
    "Aranmula Kannadi", "Bastar Iron Craft", "Coir Products", "Kondagaon", "Nirmal Paintings",
    "Pembarthi Brassware", "Risa and Rignai Weaving", "Tanjore Paintings", "Thangka Paintings",
    "Pattachitra", "Manipuri Dance Costumes", "Apatani Weaving"
  ],
  babyShower: [
    "Kondapalli Toys", "Channapatna Toys", "Madhubani Painting", "Warli Painting", 
    "Phulkari Embroidery", "Handmade Baby Blankets", "Tanjore Paintings", "Wooden Rocking Horses"
  ],
  engagement: [
    "Diamond Jewellery", "Gold Plated Jewellery", "Madhubani Art", "Handcrafted Gifts",
    "Phad Painting", "Blue Pottery", "Brassware", "Warli Art"
  ],
  retirement: [
    "Wooden Carvings", "Brass Statues", "Tanjore Paintings", "Madhubani Painting", 
    "Personalized Handicrafts", "Terracotta Items", "Handwoven Scarves", "Stone Craft"
  ]
};

router.get('/gift-assistant/:occasion', async (req, res) => {
  try {
    const { occasion } = req.params;
    const crafts = occasionMap[occasion.toLowerCase()];

    if (!crafts) {
      return res.status(400).json({ error: 'Invalid occasion' });
    }

    const products = await Product.find({ craft: { $in: crafts } });
    res.json(products);
  } catch (error) {
    console.error('Gift Assistant Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;