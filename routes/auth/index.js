const express = require('express');
const isEmailVerified = require('../../middleware/emailVerified')
const AuthController = require('../../controllers/auth');
const router = express.Router();

// Register user
router.post('/register', AuthController.registerUser);

// Verify email endpoint
router.get('/verify-email', AuthController.verifyEmail);

// Login user
router.post('/login', isEmailVerified, AuthController.loginUser);

module.exports = router;
