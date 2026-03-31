const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct); // Only Admin can create

module.exports = router;
