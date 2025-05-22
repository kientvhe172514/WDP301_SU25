// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();



// Forgot password
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);

// GET /api/account 
router.get("/", authController.getProfile);

// PUT /api/account 
router.put("/", authController.updateProfile);

// PUT /api/account/change-password
router.put("/change-password", authController.changePassword);


module.exports = router;