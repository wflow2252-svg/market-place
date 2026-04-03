const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ حذف الـ backdoor - كل المستخدمين بيتحققوا من الـ DB
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, isVerified: true },
      });

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
      }
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
