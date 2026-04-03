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
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
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
        brandProfile: { select: { logo: true, description: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الماركات' });
  }
};

// @desc    Create a new brand account (unverified)
// @route   POST /v1/users/brand
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات' });

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (userExists) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: false,
        otp: activationCode,
        brandProfile: { create: {} }
      },
    });

    res.status(201).json({ success: true, message: 'تم إنشاء البراند بنجاح', brand: { id: brandUser.id, activationCode } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء البراند: ' + error.message });
  }
};

// @desc    Create a premium brand (Elite Init)
// @route   POST /v1/elite-brand-init
// @access  Private/Admin
const createBrandLuxe = async (req, res) => {
  try {
    const { name, email, password, brandLogo, brandBanner, brandDescription, brandTheme } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات الأساسية' });
    }

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (userExists) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create User and Profile in one transaction
    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: false,
        otp: activationCode,
        brandProfile: {
          create: {
            logo: brandLogo,
            banner: brandBanner,
            description: brandDescription,
            theme: brandTheme
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'تم تدشين الماركة النخبوية بنجاح بنجاح', 
      brand: { id: brandUser.id, activationCode } 
    });
  } catch (error) {
    console.error('[Elite Brand Init Error]:', error);
    res.status(500).json({ success: false, message: 'خطأ في التدشين: ' + error.message });
  }
};

// @desc    Delete user
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الحذف' });
  }
};

// @desc    Toggle verification status
// @access  Private/Admin
const toggleVerify = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isVerified: !user.isVerified }
    });
    res.json({ success: true, message: `تم تحديث حالة التفعيل إلى ${updated.isVerified}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في التفعيل' });
  }
};

// @desc    Update user role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role }
    });
    res.json({ success: true, message: 'تم تحديث الرتبة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في التحديث' });
  }
};

// @desc    Get public brand profile
// @access  Public
const getBrandProfile = async (req, res) => {
  try {
    const brand = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
          id: true, name: true, 
          brandProfile: { select: { logo: true, banner: true, description: true } }
      }
    });
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ' });
  }
};

module.exports = { getUsers, getBrands, createBrand, createBrandLuxe, deleteUser, toggleVerify, updateUserRole, getBrandProfile };
