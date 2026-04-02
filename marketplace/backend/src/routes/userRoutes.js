const express = require('express');
const router = express.Router();
const { getUsers, getBrands, createBrand, getBrandProfile, updateBrandProfile } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/brands', getBrands); // Public verified brands
router.post('/brand', protect, admin, createBrand);

router.get('/brand/:id', getBrandProfile);
router.put('/brand/:id', protect, admin, updateBrandProfile);

module.exports = router;
