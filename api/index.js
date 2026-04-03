const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Security & Headers
app.disable('x-powered-by');

// ✅ CORS مصلح - بيسمح للفرونت يتكلم مع الباك
app.use(cors({
  origin: [
    'https://market-place-five-iota.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ✅ Routes - استخدام path.join عشان يشتغل صح على Vercel
const authRoutes = require(path.join(__dirname, '../backend/src/routes/authRoutes'));
const userRoutes = require(path.join(__dirname, '../backend/src/routes/userRoutes'));
const productRoutes = require(path.join(__dirname, '../backend/src/routes/productRoutes'));
const brandRoutes = require(path.join(__dirname, '../backend/src/routes/brandRoutes'));

app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/products', productRoutes);
app.use('/v1/brands', brandRoutes);

// ✅ Health Check
app.get('/v1/health', async (req, res) => {
  try {
    const prisma = require(path.join(__dirname, '../backend/src/utils/db'));
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      message: 'DATABASE_CONNECTED',
      env: {
        has_db_url: !!process.env.DATABASE_URL,
        has_jwt_secret: !!process.env.JWT_SECRET,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'DB_CONNECTION_FAILED',
      error: error.message
    });
  }
});

app.get('/v1', (req, res) => {
  return res.status(200).json({ message: 'API_ROOT_ACTIVE' });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
