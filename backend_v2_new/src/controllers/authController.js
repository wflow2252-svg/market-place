const bcrypt = require('bcryptjs');
const prisma = require('../utils/db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات المطلوبة' });
    }

    // ✅ التحقق من صحة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صحيح' });
    }

    // ✅ التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isVerified: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح!',
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });

  } catch (error) {
    console.error(`[Signup Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في الخادم، يرجى المحاولة مرة أخرى' });
  }
};

// @desc    Verify OTP
// @route   POST /v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني والرمز' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'الحساب محقق مسبقاً' });
    }

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'الرمز غير صحيح أو منتهي الصلاحية' });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    res.json({ success: true, message: 'تم التحقق من البريد الإلكتروني بنجاح! يمكنك تسجيل الدخول الآن.' });

  } catch (error) {
    console.error(`[verifyOtp Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

// @desc    Login user
// @route   POST /v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'برجاء تفعيل الحساب أولاً باستخدام الكود من الإدارة' });
    }

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(`[Login Error]: ${error.message}`);

    if (error.message.includes("Can't reach database") || error.message.includes('connect')) {
      return res.status(500).json({
        success: false,
        message: 'فشل الاتصال بقاعدة البيانات. تحقق من DATABASE_URL في Vercel.'
      });
    }

    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
};

// @desc    Get user profile
// @route   GET /v1/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    if (user) {
      res.json({ success: true, profile: user });
    } else {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
  } catch (error) {
    console.error(`[getUserProfile Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

module.exports = { registerUser, verifyOtp, loginUser, getUserProfile };
