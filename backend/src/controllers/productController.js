const prisma = require('../utils/db');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching products' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, description, price, stock, images, categoryId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        images,
        categoryId,
      },
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
};
