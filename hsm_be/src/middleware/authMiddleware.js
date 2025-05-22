const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/AccountModel");
dotenv.config();

const checkAdminMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await Account.findById(decoded.id)
            .populate('permissions')
            .select('-Password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Check specifically for Admin permission
        const isAdmin = user.permissions.some(p => p.PermissionName === "Admin");
        if (!isAdmin) {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                status: "Error",
            });
        }

        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

const checkAuthMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await Account.findById(decoded.id)
            .populate('permissions')
            .select('-Password');

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Just verify the user is logged in, no specific permission check
        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

module.exports = {
    checkAdminMiddleware,  // for admin-only routes
    checkAuthMiddleware,   // for any authenticated user
};
