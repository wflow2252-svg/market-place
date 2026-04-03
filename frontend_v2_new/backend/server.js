const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Security Middlewares ===
// Hide Express info & use Helmet for Security Headers
app.disable('x-powered-by');
app.use(helmet());

// Prevent XSS attacks (Sanitize form inputs)
// app.use(xss()); // Disabled because xss-clean mutates req properties and clashes with Express 5

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
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
    credentials: true
}));
app.use(express.json());

// General API Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, 
    message: { success: false, message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' }
});
app.use('/api', limiter);

// Strict Rate Limiting for auth/login
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: { success: false, message: 'تجاوزت عدد محاولات الدخول الخاطئة (5 محاولات). تم حظر الـ IP لمدة 10 دقائق لحمايتك.' }
});
app.use('/api/auth/login', loginLimiter);

// === Application Routes ===
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Setup Health Check
app.get('/api/health', async (req, res) => {
    try {
        const prisma = require('./src/utils/db');
        await prisma.$queryRaw`SELECT 1`;
        res.json({ success: true, message: 'Secure Backend is running perfectly with Prisma and Database connection.' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(500).json({ success: false, message: 'Backend is running but cannot connect to the database.', error: error.message });
    }
});

// Base Route (Confirm server is running)
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Welcome to LuxeBrands Secure API!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Error Handler] ${err.message}`);
    res.status(500).json({ success: false, message: 'حدث خطأ داخلي في الخادم.' });
});

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[Security] Node Server is running safely on port ${PORT}`);
    });
}

// Export for Vercel Serverless Functions
module.exports = app;
