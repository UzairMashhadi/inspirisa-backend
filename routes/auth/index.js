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

// Logout user
router.get('/logout', AuthController.logoutUser);

// Forgot password - Send reset email
router.post('/forgot-password', AuthController.initiatePasswordReset);

// Reset password - Verify token and update password
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;
