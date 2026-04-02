const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   GET /v1/orders
router.get('/', protect, admin, getOrders);

// @route   PUT /v1/orders/:id/status
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
