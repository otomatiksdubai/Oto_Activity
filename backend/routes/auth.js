const express = require('express');
const { login, logout, register, verifyPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.post('/verify-password', authMiddleware, verifyPassword);

module.exports = router;
