const express = require("express");
const AccountController = require("../controllers/AccountController");
const { checkAuthMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/account/login:
 *   post:
 *     summary: Login to account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", AccountController.loginAccount);

/**
 * @swagger
 * /api/account/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post("/refresh-token", AccountController.refreshToken);

/**
 * @swagger
 * /api/account/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Email not found
 *       500:
 *         description: Error sending reset email
 */
router.post("/forgot-password", AccountController.requestPasswordReset);

/**
 * @swagger
 * /api/account/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Error resetting password
 */
router.post("/reset-password/:token", AccountController.resetPassword);

/**
 * @swagger
 * /api/account/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/profile", checkAuthMiddleware, AccountController.getProfile);

/**
 * @swagger
 * /api/account/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *               cccd:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/profile", checkAuthMiddleware, AccountController.updateProfile);

/**
 * @swagger
 * /api/account/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/change-password", checkAuthMiddleware, AccountController.changePassword);

module.exports = router;