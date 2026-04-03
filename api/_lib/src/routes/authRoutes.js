const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
