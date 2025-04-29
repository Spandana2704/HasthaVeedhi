const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, orderController.createOrder);
router.get('/history', protect, orderController.getOrderHistory);
router.get('/:id', protect, orderController.getOrderDetails);
router.put('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.put('/:id/status', protect, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  next();
}, orderController.updateOrderStatus);

module.exports = router;