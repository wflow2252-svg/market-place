const prisma = require('../utils/db');

// @desc    Get all verified brands (Public)
// @route   GET /v1/brands
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.user.findMany({
      where: { role: 'BRAND', isVerified: true },
      include: { brandProfile: true, _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: brands.length, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الماركات' });
  }
};

// @desc    Get public brand profile by ID
// @route   GET /v1/brands/:id
const getBrandProfilePublic = async (req, res) => {
  try {
    const brand = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        brandProfile: true,
        products: { include: { category: true } }
      }
    });

    if (!brand || brand.role !== 'BRAND') {
      return res.status(404).json({ success: false, message: 'الماركة غير موجودة' });
    }

    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الماركة' });
  }
};

// @desc    Get current brand profile (Private/Dashboard)
// @route   GET /v1/brand/profile
const getBrandProfile = async (req, res) => {
  try {
    const profile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!profile) {
      const newProfile = await prisma.brandProfile.create({
        data: { userId: req.user.id, description: '', logo: '', banner: '', theme: JSON.stringify({ primary: '#e67e22' }) }
      });
      return res.json({ success: true, profile: newProfile });
    }
    
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات البروفايل' });
  }
};

// @desc    Update brand profile
// @route   PUT /v1/brand/profile
const updateBrandProfile = async (req, res) => {
  try {
    const { logo, banner, description, theme, isPaused } = req.body;
    
    const profile = await prisma.brandProfile.upsert({
      where: { userId: req.user.id },
      update: { logo, banner, description, theme, isPaused },
      create: { userId: req.user.id, logo, banner, description, theme, isPaused }
    });
    
    res.json({ success: true, message: 'تم حفظ البروفايل بنجاح', profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في حفظ البروفايل' });
  }
};

module.exports = { getBrands, getBrandProfilePublic, getBrandProfile, updateBrandProfile };
