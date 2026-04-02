const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// ✅ الحل الذكي والأخير لمشكلة الـ Environment Variables في Vercel
// إذا لم تكن موجودة في Dashboard سيتم الربط تلقائياً من الكود هنا

const DB_URL = "postgresql://postgres.ilrxkhgdsirqppgqavjs:Code2252_2252@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const JWT_SEC = "LuxeBrandsSecureSecretKey2026_Hazem";

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = DB_URL;
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = JWT_SEC;

// 1️⃣ إعداد قاعدة البيانات (Prisma Singleton)
let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global._prisma) {
    global._prisma = new PrismaClient();
  }
  prisma = global._prisma;
}

// 2️⃣ إعدادات الخادم والـ JWT
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 3️⃣ الـ Middleware للحماية
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, role: true } });
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Unauthorized / Invalid Token' });
    }
  }
  if (!token) res.status(401).json({ success: false, message: 'No Token Provided' });
};

// 4️⃣ الـ Handlers (Controllers)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ success: false, message: 'خطأ في الدخول' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'خطأ في الدخول' });

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'برجاء تفعيل الحساب أولاً باستخدام الكود من الإدارة' });
    }

    res.json({
      success: true,
      token: generateToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `DB_ERROR: ${error.message}` });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات' });

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (userExists) return res.status(400).json({ success: false, message: 'البريد مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const assignedRole = email.toLowerCase() === 'zomatube2012@gmail.com' ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashedPassword, role: assignedRole, isVerified: true }
    });

    res.status(201).json({
      success: true,
      token: generateToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `REG_ERROR: ${error.message}` });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني والرمز' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'الحساب محقق مسبقاً' });

    const isValidOtp = String(user.otp) === String(otp);
    if (!isValidOtp) return res.status(400).json({ success: false, message: 'الرمز غير صحيح' });

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { isVerified: true, otp: null }
    });

    res.json({ success: true, message: 'تم التفعيل بنجاح! يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: `GET_USERS_ERROR: ${error.message}` });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال جميع البيانات' });

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (userExists) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Generate a random 6-digit OTP just to send it in the email logic if needed
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const brandUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'BRAND',
        isVerified: false, // Wait for activation code
        otp: otpCode
      },
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب البراند بنجاح!',
      brand: { id: brandUser.id, name: brandUser.name, email: brandUser.email, role: brandUser.role, activationCode: otpCode }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `CREATE_BRAND_ERROR: ${error.message}` });
  }
};

// 5️⃣ المسارات (Routes)
app.post('/v1/auth/login', loginUser);
app.post('/v1/auth/register', registerUser);
app.post('/v1/auth/verify-otp', verifyOtp);
app.get('/v1/auth/profile', protect, (req, res) => res.json({ success: true, profile: req.user }));

app.get('/v1/users', protect, getUsers);
app.post('/v1/users/brand', protect, createBrand);

// ✅ Health Check
app.get('/v1/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, message: 'DATABASE_CONNECTED', diagnostics: { mode: 'AUTO_ENV_FALLBACK_ACTIVE', node_env: process.env.NODE_ENV } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'DB_CONNECTION_FAILED', error: error.message });
  }
});

// ✅ Root Message
app.get('/', (req, res) => res.status(200).json({ message: 'MARKETPLACE_API_ACTIVE' }));

module.exports = app;
