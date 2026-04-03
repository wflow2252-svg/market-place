const express = require('express');
const router = express.Router();
const { getUsers, getBrands, updateUserRole, toggleVerify, deleteUser, createBrand, getBrandProfile, createBrandLuxe } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   GET /v1/users
router.route('/')
  .get(protect, admin, getUsers);

// @route   GET /v1/users/brands
router.route('/brands')
  .get(getBrands);

// @route   POST /v1/users/brand
router.route('/brand')
  .post(protect, admin, createBrand);

// @route   GET /v1/users/brand/:id
router.route('/brand/:id')
  .get(getBrandProfile);

// @route   PUT /v1/users/:id/role
router.route('/:id/role')
  .put(protect, admin, updateUserRole);

// @route   PUT /v1/users/:id/verify
router.route('/:id/verify')
  .put(protect, admin, toggleVerify);

// @route   DELETE /v1/users/:id
router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;
