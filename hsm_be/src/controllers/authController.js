// controllers/authController.js
const Account = require("../models/AccountModel");
const Employee = require("../models/EmployeeModel");
const Customer = require("../models/CustomerModel");
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

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const accountId = req.account._id;

        // Lấy thông tin account
        const account = await Account.findById(accountId)
            .populate('permissions', 'PermissionName Note')
            .select('-Password -refreshToken');

        if (!account) {
            return res.status(404).json({
                message: "Account not found",
                status: "Error"
            });
        }

        // Lấy thông tin employee nếu có
        const employee = await Employee.findOne({ accountId: accountId })
            .populate('hotels', 'name')
            .populate('permission', 'PermissionName Note');

        const profileData = {
            account: {
                id: account._id,
                fullName: account.FullName,
                email: account.Email,
                username: account.Username,
                permissions: account.permissions,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt
            }
        };

        // Nếu có thông tin employee thì thêm vào
        if (employee) {
            profileData.employee = {
                id: employee._id,
                fullName: employee.FullName,
                phone: employee.Phone,
                email: employee.Email,
                gender: employee.Gender,
                image: employee.Image,
                address: employee.Address,
                hotels: employee.hotels,
                permission: employee.permission,
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt
            };
        }

        return res.status(200).json({
            message: "Get profile successfully",
            status: "Success",
            data: profileData
        });

    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: "Error"
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const accountId = req.account._id;
        const {
            fullName,
            username,
            phone,
            gender,
            address,
            image
        } = req.body;

        // Validate input
        if (!fullName || !username) {
            return res.status(400).json({
                message: "Full name and username are required",
                status: "Error"
            });
        }

        // Kiểm tra username đã tồn tại chưa (trừ user hiện tại)
        const existingAccount = await Account.findOne({
            Username: username,
            _id: { $ne: accountId }
        });

        if (existingAccount) {
            return res.status(400).json({
                message: "Username already exists",
                status: "Error"
            });
        }

        // Validate phone format nếu có
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Phone number must be exactly 10 digits",
                status: "Error"
            });
        }

        // Cập nhật thông tin account
        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            {
                FullName: fullName,
                Username: username
            },
            { new: true, runValidators: true }
        ).populate('permissions', 'PermissionName Note')
            .select('-Password -refreshToken');

        if (!updatedAccount) {
            return res.status(404).json({
                message: "Account not found",
                status: "Error"
            });
        }

        // Cập nhật thông tin employee nếu có
        let updatedEmployee = null;
        const employee = await Employee.findOne({ accountId: accountId });

        if (employee) {
            const employeeUpdateData = {
                FullName: fullName
            };

            // Chỉ cập nhật các field có giá trị
            if (phone !== undefined) employeeUpdateData.Phone = phone;
            if (gender !== undefined) employeeUpdateData.Gender = gender;
            if (address !== undefined) employeeUpdateData.Address = address;
            if (image !== undefined) employeeUpdateData.Image = image;

            updatedEmployee = await Employee.findByIdAndUpdate(
                employee._id,
                employeeUpdateData,
                { new: true, runValidators: true }
            ).populate('hotels', 'name')
                .populate('permission', 'PermissionName Note');
        }

        const responseData = {
            account: {
                id: updatedAccount._id,
                fullName: updatedAccount.FullName,
                email: updatedAccount.Email,
                username: updatedAccount.Username,
                permissions: updatedAccount.permissions,
                updatedAt: updatedAccount.updatedAt
            }
        };

        if (updatedEmployee) {
            responseData.employee = {
                id: updatedEmployee._id,
                fullName: updatedEmployee.FullName,
                phone: updatedEmployee.Phone,
                email: updatedEmployee.Email,
                gender: updatedEmployee.Gender,
                image: updatedEmployee.Image,
                address: updatedEmployee.Address,
                hotels: updatedEmployee.hotels,
                permission: updatedEmployee.permission,
                updatedAt: updatedEmployee.updatedAt
            };
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            status: "Success",
            data: responseData
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: "Error"
        });
    }
};

// Password validation function
const validatePassword = (password) => {
    if (password.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái in hoa.";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái thường.";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất một số.";
    if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&).";
    return null; // No error
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const accountId = req.account._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All password fields are required",
                status: "Error"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
                status: "Error"
            });
        }

        // Validate new password strength
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({
                message: passwordError,
                status: "Error"
            });
        }

        // Kiểm tra mật khẩu mới không giống mật khẩu cũ
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "Mật khẩu mới phải khác mật khẩu hiện tại",
                status: "Error"
            });
        }

        // Lấy thông tin account với password
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({
                message: "Account not found",
                status: "Error"
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.Password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: "Current password is incorrect",
                status: "Error"
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 12; // Tăng độ bảo mật
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu và xóa tất cả refresh token (logout khỏi tất cả device)
        await Account.findByIdAndUpdate(accountId, {
            Password: hashedNewPassword,
            refreshToken: null // Clear refresh token để bắt buộc đăng nhập lại
        });

        return res.status(200).json({
            message: "Password changed successfully. Please login again.",
            status: "Success"
        });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: "Error"
        });
    }
};