const prisma = require('../utils/db');

// @desc    Fetch all products (public)
// @route   GET /v1/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, brandId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category) where.categoryId = parseInt(category);
    if (brandId) where.brandId = parseInt(brandId);
    if (search) where.name = { contains: search, mode: 'insensitive' };

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

    res.json({ success: true, count: products.length, total, pages: Math.ceil(total / parseInt(limit)), data: products });
  } catch (error) {
    console.error(`[getProducts Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات' });
  }
};

// @desc    Get products for a specific brand (public)
// @route   GET /v1/products/brand/:brandId
// @access  Public
const getProductsByBrand = async (req, res) => {
  try {
    const brandId = parseInt(req.params.brandId);
    const products = await prisma.product.findMany({
      where: { brandId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error(`[getProductsByBrand Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب منتجات البراند' });
  }
};

// @desc    Create a product (Admin)
// @route   POST /v1/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, categoryId, brandId } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'اسم المنتج والسعر مطلوبان' });
    if (isNaN(price) || price <= 0) return res.status(400).json({ success: false, message: 'السعر يجب أن يكون رقماً موجباً' });

    const product = await prisma.product.create({
      data: {
        name, description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        images,
        categoryId: categoryId ? parseInt(categoryId) : null,
        brandId: brandId ? parseInt(brandId) : null,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(`[createProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'فشل إنشاء المنتج', error: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /v1/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, stock, images, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(images !== undefined && { images }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
      },
      include: { category: { select: { id: true, name: true } } }
    });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error(`[updateProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المنتج' });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /v1/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error(`[deleteProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في حذف المنتج' });
  }
};

module.exports = { getProducts, getProductsByBrand, createProduct, updateProduct, deleteProduct };
