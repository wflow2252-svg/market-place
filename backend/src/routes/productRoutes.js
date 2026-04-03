const express = require('express');
const router = express.Router();
const { getProducts, getProductsByBrand, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.get('/brand/:brandId', getProductsByBrand);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
