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
        brandProfile: {
          select: { isPaused: true, logo: true }
        },
        _count: { select: { products: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(`[getUsers Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في جلب المستخدمين' });
  }
};

// @desc    Delete a user
// @route   DELETE /v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'لا يمكن حذف حساب الأدمن' });

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error(`[deleteUser Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في حذف المستخدم' });
  }
};

// @desc    Update user role
// @route   PATCH /v1/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    const validRoles = ['USER', 'BRAND', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'دور غير صالح' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true }
    });

    // إذا أصبح BRAND، أنشئ BrandProfile له تلقائياً
    if (role === 'BRAND') {
      const existing = await prisma.brandProfile.findUnique({ where: { userId: id } });
      if (!existing) {
        await prisma.brandProfile.create({ data: { userId: id } });
      }
    }

    res.json({ success: true, message: 'تم تحديث الدور بنجاح', user });
  } catch (error) {
    console.error(`[updateUserRole Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الدور' });
  }
};

// @desc    Toggle user verification
// @route   PATCH /v1/users/:id/verify
// @access  Private/Admin
const toggleVerify = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isVerified: !user.isVerified },
      select: { id: true, name: true, isVerified: true }
    });

    res.json({ success: true, message: `تم ${updated.isVerified ? 'تفعيل' : 'إلغاء تفعيل'} الحساب`, user: updated });
  } catch (error) {
    console.error(`[toggleVerify Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الحالة' });
  }
};

// @desc    Create a new brand account
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

    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: true, // Admin-created brands are pre-verified
        brandProfile: { create: {} } // Create empty profile automatically
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب البراند بنجاح!',
      brand: {
        id: brandUser.id,
        name: brandUser.name,
        email: brandUser.email,
        role: brandUser.role,
      },
    });
  } catch (error) {
    console.error(`[createBrand Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء البراند' });
  }
};

module.exports = { getUsers, deleteUser, updateUserRole, toggleVerify, createBrand };
