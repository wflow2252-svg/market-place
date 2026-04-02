const express = require('express');
const router = express.Router();
const { getUsers, createBrand } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getUsers);
router.post('/brand', protect, admin, createBrand);

module.exports = router;
