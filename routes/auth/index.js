const express = require('express');
const isEmailVerified = require('../../middleware/emailVerified')
const AuthController = require('../../controllers/auth');
const auth = require('../../middleware/auth/auth');
const router = express.Router();

router.post('/register', AuthController.registerUser);

router.get('/verify-email', AuthController.verifyEmail);

router.post('/login', isEmailVerified, AuthController.loginUser);

router.get('/logout', AuthController.logoutUser);

router.post('/forgot-password', AuthController.initiatePasswordReset);

router.post('/reset-password', AuthController.resetPassword);

router.get('/check-token', AuthController.checkToken);

router.post('/change-password', auth, AuthController.changePassword);

router.patch('/update-user', auth, AuthController.updateUser);

module.exports = router;
