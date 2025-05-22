// routes/authRoutes.js
const express = require('express');
const { requestPasswordReset, resetPassword } = require('../controllers/authController');

const router = express.Router();



// Forgot password
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);


module.exports = router;