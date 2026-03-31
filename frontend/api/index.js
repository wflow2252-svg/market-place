const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Security & Headers
app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes - Direct mapping for maximum reliability when the frontend is the root
// Looking for backend/src inside the frontend folder
const authRoutes = require('../backend/src/routes/authRoutes');
const userRoutes = require('../backend/src/routes/userRoutes');

// These routes already have /v1 or /auth inside if they are subrouters
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);

// Direct Health Check Route (Bypass everything)
app.get('/v1/health', async (req, res) => {
    try {
        const prisma = require('../backend/src/utils/db');
        await prisma.$queryRaw`SELECT 1`;
        return res.status(200).json({ success: true, message: 'DATABASE_CONNECTED' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'DB_CONNECTION_FAILED', error: error.message });
    }
});

// Root API test
app.get('/v1', (req, res) => {
    return res.status(200).json({ message: 'API_ROOT_ACTIVE' });
});

module.exports = app;
