const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { simulatePayment } = require('../services/paymentService');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const discountedPrice = item.productId.price * (1 - (item.productId.discount / 100));
      return total + (discountedPrice * item.quantity);
    }, 0);

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      priceAtPurchase: item.productId.price,
      discountAtPurchase: item.productId.discount
    }));

    // Process payment (simulated)
    const paymentResult = await simulatePayment({
      amount: totalAmount,
      method: paymentMethod
    });

    if (!paymentResult.success) {
      return res.status(400).json({ 
        error: 'Payment failed', 
        details: paymentResult 
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod,
        transactionId: paymentResult.transactionId,
        amount: totalAmount,
        status: paymentMethod === 'CashOnDelivery' ? 'Pending' : paymentResult.status,
    paymentDate: paymentMethod === 'CashOnDelivery' ? null : new Date()
  },
  totalAmount,
  status: paymentMethod === 'CashOnDelivery' ? 'Pending' : 'Processing',
  estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      order,
      payment: paymentResult
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create order' 
    });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.productId');

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId')
      .populate('user', 'username email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure user can only access their own orders
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Only allow cancellation for certain statuses
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    order.status = 'Cancelled';
    
    // Initiate refund if payment was made
    if (order.payment.status === 'Completed') {
      order.payment.status = 'Refunded';
      // In a real system, we would call payment gateway API here
    }

    await order.save();

    res.status(200).json({ 
      success: true, 
      message: 'Order cancelled successfully',
      order 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Pending': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered', 'Returned'],
      'Delivered': ['Returned'],
      'Cancelled': [],
      'Returned': ['Refunded'],
      'Refunded': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update order
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'Shipped') {
      order.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    }

    await order.save();

    res.status(200).json({ 
      success: true, 
      message: 'Order status updated',
      order 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};