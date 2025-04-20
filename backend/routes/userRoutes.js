const express = require('express');
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router  = express.Router();

router.get('/wishlist',  protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist', protect, removeFromWishlist);

module.exports = router;
