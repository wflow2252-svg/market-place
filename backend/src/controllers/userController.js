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
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: false,
        otp: otpCode
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
        activationCode: otpCode
      },
    });
  } catch (error) {
    console.error(`[createBrand Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء البراند' });
  }
};

module.exports = { getUsers, createBrand };
