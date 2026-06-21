const express = require('express');
const router = express.Router();
const { register, login, getMe, getPublicJabatan } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.post('/register', register);
router.post('/login', login);
router.get('/public/jabatan', getPublicJabatan); // For registration form dropdown

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
