const express = require('express');
const router = express.Router();
const {
  getBrands, getBrandById,
  getMyProfile, updateMyProfile, togglePause, adminTogglePause,
  getMyProducts, addMyProduct, updateMyProduct, deleteMyProduct
} = require('../controllers/brandController');
const { protect, admin } = require('../middlewares/authMiddleware');

// middleware يتحقق إن المستخدم براند
const brandOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'BRAND' || req.user.role === 'ADMIN')) return next();
  return res.status(403).json({ success: false, message: 'هذا المسار للبراندات فقط' });
};

// Public
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Brand self-management
router.get('/me/profile', protect, brandOnly, getMyProfile);
router.put('/me/profile', protect, brandOnly, updateMyProfile);
router.patch('/me/pause', protect, brandOnly, togglePause);
router.get('/me/products', protect, brandOnly, getMyProducts);
router.post('/me/products', protect, brandOnly, addMyProduct);
router.put('/me/products/:id', protect, brandOnly, updateMyProduct);
router.delete('/me/products/:id', protect, brandOnly, deleteMyProduct);

// Admin actions on brand
router.patch('/:id/pause', protect, admin, adminTogglePause);

module.exports = router;
