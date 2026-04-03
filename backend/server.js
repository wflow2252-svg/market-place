const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Security Middlewares ===
app.disable('x-powered-by');
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' }
});
app.use('/v1', limiter);

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'تجاوزت عدد محاولات الدخول الخاطئة (5 محاولات). تم حظر الـ IP لمدة 10 دقائق.' }
});
app.use('/v1/auth/login', loginLimiter);

// === Routes ===
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/v1/auth', authRoutes);
app.use('/v1/products', productRoutes);
app.use('/v1/users', userRoutes);

// Health Check
app.get('/v1/health', async (req, res) => {
  try {
    const prisma = require('./src/utils/db');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Backend running with DB connection.',
      env: {
        has_db_url: !!process.env.DATABASE_URL,
        has_jwt: !!process.env.JWT_SECRET,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'DB connection failed.', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to LuxeBrands API!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error Handler] ${err.message}`);
  res.status(500).json({ success: false, message: 'حدث خطأ داخلي في الخادم.' });
});

// Listen locally only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/v1/health`);
  });
}

module.exports = app;
