const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

// Pre-flight middleware
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// 🛡️ REFINED PATH RESOLUTION - Standard Vercel Root
const getModulePath = (relativePath) => {
    const rootCandidates = [
        process.cwd(),
        path.join(__dirname, '..'),
        path.join(process.cwd(), 'marketplace')
    ];
    
    for (const root of rootCandidates) {
        const fullPath = path.join(root, relativePath);
        if (fs.existsSync(fullPath) || fs.existsSync(fullPath + '.js') || fs.existsSync(fullPath + '/index.js')) {
            return fullPath;
        }
    }
    // Fallback
    return path.join(process.cwd(), relativePath);
};

// Mount Routes Safely
try {
    const authRoutes = require(getModulePath('backend/src/routes/authRoutes'));
    const userRoutes = require(getModulePath('backend/src/routes/userRoutes'));
    const productRoutes = require(getModulePath('backend/src/routes/productRoutes'));
    const brandRoutes = require(getModulePath('backend/src/routes/brandRoutes'));
    const settingsRoutes = require(getModulePath('backend/src/routes/settingsRoutes'));
    const orderRoutes = require(getModulePath('backend/src/routes/orderRoutes'));

    const { createBrandLuxe } = require(getModulePath('backend/src/controllers/userController'));
    const { protect, admin } = require(getModulePath('backend/src/middlewares/authMiddleware'));

    app.use('/v1/auth', authRoutes);
    app.use('/v1/users', userRoutes);
    app.post('/v1/elite-brand-init', protect, admin, createBrandLuxe);
    app.use('/v1/brand', brandRoutes);
    app.use('/v1/brands', brandRoutes);
    app.use('/v1/products', productRoutes);
    app.use('/v1/settings', settingsRoutes);
    app.use('/v1/orders', orderRoutes);
} catch (e) {
    console.error('[BOOT_ERROR]:', e);
    app.get('/v1/*', (req, res) => res.status(500).json({ 
        success: false, 
        message: 'BOOT_ERROR: Missing Backend Components', 
        error: e.message,
        path: e.path
    }));
}

// Health Check
app.get('/v1/health', async (req, res) => {
    try {
        const prisma = require(getModulePath('backend/src/utils/db'));
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ success: true, message: 'DATABASE_LIVE' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'DATABASE_OFFLINE', error: error.message });
    }
});

app.get('/v1', (req, res) => res.json({ message: 'API_ELITE_ROOT_ACTIVE_V12_SYNCED' }));

// Final Wildcard API 404 - MUST catch all methods
app.all('/v1/*', (req, res) => {
    res.status(404).json({ success: false, message: `API_NOT_FOUND: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
