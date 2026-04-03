const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUserRole, toggleVerify, createBrand } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getUsers);
router.post('/brand', protect, admin, createBrand);
router.delete('/:id', protect, admin, deleteUser);
router.patch('/:id/role', protect, admin, updateUserRole);
router.patch('/:id/verify', protect, admin, toggleVerify);

module.exports = router;
