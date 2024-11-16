const express = require('express');
const router = express.Router();
const { signup, login, resendVerificationEmail, forgotPassword } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validators/authValidator');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);

module.exports = router; 
