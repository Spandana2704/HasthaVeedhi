const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');

router.post('/add', protect, productController.addToCart);
router.post('/remove', protect, productController.removeFromCart);
router.post('/update', protect, productController.updateCartItem);
router.get('/', protect, productController.getCart);
router.delete('/clear', protect, productController.clearCart);

module.exports = router;