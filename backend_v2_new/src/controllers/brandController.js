const prisma = require('../utils/db');

// @desc    Get all public brands
// @route   GET /v1/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.user.findMany({
      where: { role: 'BRAND' },
      select: {
        id: true,
        name: true,
        brandProfile: {
          select: {
            logo: true,
            banner: true,
            description: true,
            theme: true,
            isPaused: true,
          }
        },
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, brands });
  } catch (error) {
    console.error(`[getBrands Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب البراندات' });
  }
};

// @desc    Get single brand by ID (public)
// @route   GET /v1/brands/:id
// @access  Public
const getBrandById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.user.findFirst({
      where: { id, role: 'BRAND' },
      select: {
        id: true,
        name: true,
        brandProfile: true,
        _count: { select: { products: true } }
      }
    });
    if (!brand) return res.status(404).json({ success: false, message: 'البراند غير موجود' });
    res.json({ success: true, brand });
  } catch (error) {
    console.error(`[getBrandById Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب البراند' });
  }
};

// @desc    Get my brand profile (logged-in brand)
// @route   GET /v1/brands/me
// @access  Private/Brand
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.brandProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    if (!profile) {
      // Create an empty profile if it doesn't exist
      const newProfile = await prisma.brandProfile.create({
        data: { userId },
        include: { user: { select: { id: true, name: true, email: true } } }
      });
      return res.json({ success: true, profile: newProfile });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error(`[getMyProfile Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب البروفايل' });
  }
};

// @desc    Update my brand profile
// @route   PUT /v1/brands/me
// @access  Private/Brand
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { logo, banner, description, theme } = req.body;

    const profile = await prisma.brandProfile.upsert({
      where: { userId },
      update: {
        ...(logo !== undefined && { logo }),
        ...(banner !== undefined && { banner }),
        ...(description !== undefined && { description }),
        ...(theme !== undefined && { theme }),
      },
      create: { userId, logo, banner, description, theme },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.json({ success: true, message: 'تم تحديث البروفايل بنجاح', profile });
  } catch (error) {
    console.error(`[updateMyProfile Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث البروفايل' });
  }
};

// @desc    Toggle brand pause status
// @route   PATCH /v1/brands/me/pause
// @access  Private/Brand
const togglePause = async (req, res) => {
  try {
    const userId = req.user.id;
    const current = await prisma.brandProfile.findUnique({ where: { userId } });
    const updated = await prisma.brandProfile.upsert({
      where: { userId },
      update: { isPaused: !current?.isPaused },
      create: { userId, isPaused: true }
    });
    res.json({
      success: true,
      message: updated.isPaused ? 'تم إيقاف المتجر مؤقتاً' : 'تم تشغيل المتجر',
      isPaused: updated.isPaused
    });
  } catch (error) {
    console.error(`[togglePause Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تغيير حالة المتجر' });
  }
};

// @desc    Toggle brand pause (Admin)
// @route   PATCH /v1/brands/:id/pause
// @access  Private/Admin
const adminTogglePause = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const current = await prisma.brandProfile.findUnique({ where: { userId } });
    const updated = await prisma.brandProfile.upsert({
      where: { userId },
      update: { isPaused: !current?.isPaused },
      create: { userId, isPaused: true }
    });
    res.json({
      success: true,
      message: updated.isPaused ? 'تم إيقاف المتجر' : 'تم تفعيل المتجر',
      isPaused: updated.isPaused
    });
  } catch (error) {
    console.error(`[adminTogglePause Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تغيير حالة المتجر' });
  }
};

// @desc    Get my brand products
// @route   GET /v1/brands/me/products
// @access  Private/Brand
const getMyProducts = async (req, res) => {
  try {
    const brandId = req.user.id;
    const products = await prisma.product.findMany({
      where: { brandId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(`[getMyProducts Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات' });
  }
};

// @desc    Add a product (Brand)
// @route   POST /v1/brands/me/products
// @access  Private/Brand
const addMyProduct = async (req, res) => {
  try {
    const brandId = req.user.id;
    const { name, description, price, stock, images, categoryId } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'اسم المنتج والسعر مطلوبان' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        images: images || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        brandId
      },
      include: { category: { select: { id: true, name: true } } }
    });

    res.status(201).json({ success: true, message: 'تم إضافة المنتج بنجاح', product });
  } catch (error) {
    console.error(`[addMyProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في إضافة المنتج' });
  }
};

// @desc    Update a product (Brand — owns it)
// @route   PUT /v1/brands/me/products/:id
// @access  Private/Brand
const updateMyProduct = async (req, res) => {
  try {
    const brandId = req.user.id;
    const productId = parseInt(req.params.id);

    const existing = await prisma.product.findFirst({ where: { id: productId, brandId } });
    if (!existing) return res.status(404).json({ success: false, message: 'المنتج غير موجود أو لا تملكه' });

    const { name, description, price, stock, images, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: productId },
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

    res.json({ success: true, message: 'تم تحديث المنتج بنجاح', product });
  } catch (error) {
    console.error(`[updateMyProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المنتج' });
  }
};

// @desc    Delete a product (Brand — owns it)
// @route   DELETE /v1/brands/me/products/:id
// @access  Private/Brand
const deleteMyProduct = async (req, res) => {
  try {
    const brandId = req.user.id;
    const productId = parseInt(req.params.id);

    const existing = await prisma.product.findFirst({ where: { id: productId, brandId } });
    if (!existing) return res.status(404).json({ success: false, message: 'المنتج غير موجود أو لا تملكه' });

    await prisma.product.delete({ where: { id: productId } });
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error(`[deleteMyProduct Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في حذف المنتج' });
  }
};

module.exports = {
  getBrands, getBrandById,
  getMyProfile, updateMyProfile, togglePause, adminTogglePause,
  getMyProducts, addMyProduct, updateMyProduct, deleteMyProduct
};
