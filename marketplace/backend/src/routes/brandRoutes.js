const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

// Public Root (List all verified brands)
router.get('/', brandController.getBrands);

// Public Specific Brand (Profile + Products)
router.get('/:id', brandController.getBrandProfilePublic);

// Private Brand Owner Profile
router.route('/profile')
  .get(protect, brandController.getBrandProfile)
  .put(protect, brandController.updateBrandProfile);

// Private Brand Owner Products (CRUD)
router.route('/products')
  .get(protect, productController.getBrandProducts)
  .post(protect, productController.createProduct);

router.route('/products/:id')
  .put(protect, productController.updateProduct)
  .delete(protect, productController.deleteProduct);

module.exports = router;
