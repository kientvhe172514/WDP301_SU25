// controllers/authController.js
const Account = require('../models/AccountModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Forgot Password

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true
});


// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const account = await Account.findOne({ email });
        if (!account) return res.status(404).json({ message: 'Email không tồn tại' });

        const token = crypto.randomBytes(20).toString('hex');
        account.resetPasswordToken = token;
        account.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await account.save();

        const resetUrl = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
            to: account.Email,
            from: process.env.EMAIL_USER,
            subject: 'Reset mật khẩu',
            text: `Hãy nhấp vào liên kết sau để đặt lại mật khẩu:\n\n${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Liên kết đặt lại mật khẩu đã được gửi tới email của bạn.' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi gửi email đặt lại mật khẩu.', error: err.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const account = await Account.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!account) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        account.Password = hashedPassword;
        account.resetPasswordToken = undefined;
        account.resetPasswordExpires = undefined;
        await account.save();

        // console.log('Token:', token);
        //console.log('New Password:', newPassword);

        res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công.' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu.', error: err.message });
    }
};