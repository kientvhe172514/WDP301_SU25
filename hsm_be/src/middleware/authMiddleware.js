const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/AccountModel");
const mongoose = require("mongoose");
dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "Error",
            });
        }
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        // Fetch fresh user data including permissions
        const user = await Account.findById(decoded.id)
            .populate('permissions')
            .select('-Password');  // Exclude password

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "Error",
            });
        }

        // Check if user has admin permissions
        const isAdmin = user.permissions.some(p => p.PermissionName === "Admin");

        if (!isAdmin) {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                status: "Error",
            });
        }

        // Attach user to request object
        req.account = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            status: "Error",
        });
    }
};

const authUserMiddleware = async (req, res, next) => {
    try {
        // FIXED: Changed from req.headers.token to req.headers.authorization
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ status: "ERR", message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        if (!decoded.id || !mongoose.isValidObjectId(decoded.id)) {
            return res.status(401).json({ status: "ERR", message: "Invalid token payload" });
        }

        const user = await Account.findById(decoded.id).populate("permissions");
        if (!user) {
            return res.status(401).json({ status: "ERR", message: "User not found" });
        }

        req.account = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ status: "ERR", message: "Authentication failed" });
    }
};

module.exports = {
    authMiddleware,
    authUserMiddleware,
};
