const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /v1/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(`[getUsers Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب المستخدمين' });
  }
};

// @desc    Get all active/verified brands
// @route   GET /v1/users/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.user.findMany({
      where: { role: 'BRAND', isVerified: true },
      select: {
        id: true,
        name: true,
        brandLogo: true,
        brandDescription: true,
        brandTheme: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    console.error(`[getBrands Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب الماركات' });
  }
};

// @desc    Create a new brand account (unverified)
// @route   POST /v1/users/brand
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات' });
    }

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ توليد كود تفعيل للماركة
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: false, // 🛑 يبدأ غير مفعل
        otp: activationCode,
        otpExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // صالح لـ 7 أيام
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح! كود التفعيل جاهز للإرسال.',
      brand: {
        id: brandUser.id,
        name: brandUser.name,
        email: brandUser.email,
        activationCode: brandUser.otp, // نرسل الكود للأدمن ليقوم بإرساله
      },
    });
  } catch (error) {
    console.error(`[createBrand Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء البراند' });
  }
};

// @desc    Get public brand profile
// @route   GET /v1/users/brand/:id
// @access  Public
const getBrandProfile = async (req, res) => {
  try {
    const brandId = parseInt(req.params.id);
    const brand = await prisma.user.findUnique({
      where: { id: brandId, role: 'BRAND' },
      select: {
        id: true,
        name: true,
        brandLogo: true,
        brandBanner: true,
        brandDescription: true,
        products: true
      }
    });

    if (!brand) return res.status(404).json({ success: false, message: 'الماركة غير موجودة' });

    res.json({ success: true, brand });
  } catch (error) {
    console.error(`[getBrandProfile Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الماركة' });
  }
};

// @desc    Update brand profile Details
// @route   PUT /v1/users/brand/:id
// @access  Private/Admin or Brand Owner
const updateBrandProfile = async (req, res) => {
  try {
    const brandId = parseInt(req.params.id);
    const { brandLogo, brandBanner, brandDescription } = req.body;

    const brand = await prisma.user.update({
      where: { id: brandId },
      data: {
        brandLogo: brandLogo !== undefined ? brandLogo : undefined,
        brandBanner: brandBanner !== undefined ? brandBanner : undefined,
        brandDescription: brandDescription !== undefined ? brandDescription : undefined,
      }
    });

    res.json({ success: true, message: 'تم تحديث واجهة الماركة بنجاح' });
  } catch (error) {
    console.error(`[updateBrandProfile Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث البيانات' });
  }
};

module.exports = { getUsers, createBrand, getBrandProfile, updateBrandProfile };
