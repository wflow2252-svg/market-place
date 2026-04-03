const express = require('express');
const router = express.Router();
const { getSiteSettings, toggleMaintenance } = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   GET /v1/settings
router.get('/', getSiteSettings);

// @route   PUT /v1/settings/maintenance
router.put('/maintenance', protect, admin, toggleMaintenance);

module.exports = router;
