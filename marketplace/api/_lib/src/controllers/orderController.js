const prisma = require('../utils/db');

// @desc    Get all orders
// @route   GET /v1/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('[Get Orders Error]:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: order
    });
  } catch (error) {
    console.error('[Update Order Status Error]:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus
};
