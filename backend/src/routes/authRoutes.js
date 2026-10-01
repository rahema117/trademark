const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
