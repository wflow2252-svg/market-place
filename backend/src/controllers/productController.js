const prisma = require('../utils/db');

// @desc    Fetch all products
// @route   GET /v1/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const where = {};

    // ✅ فلترة بالكاتيجوري
    if (category) {
      where.categoryId = parseInt(category);
    }

    // ✅ بحث بالاسم
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    console.error(`[getProducts Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات' });
  }
};

// @desc    Create a product
// @route   POST /v1/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, categoryId } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'اسم المنتج والسعر مطلوبان' });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'السعر يجب أن يكون رقماً موجباً' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        images,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(`[createProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'فشل إنشاء المنتج', error: error.message });
  }
};

module.exports = { getProducts, createProduct };
