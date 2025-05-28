const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Account = require("../models/AccountModel");
const Permission = require("../models/PermissionModel");
dotenv.config();

const checkAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Admin Middleware - Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided or invalid format.",
        status: "Error",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Admin Middleware - Token:", token);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    console.log("Admin Middleware - Decoded:", decoded);

    const user = await Account.findById(decoded.id)
      .populate("permissions")
      .select("-Password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        status: "Error",
      });
    }

    const isAdmin = user.permissions.some((p) => p.PermissionName === "Admin");
    if (!isAdmin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
        status: "Error",
      });
    }

    req.account = user;
    next();
  } catch (error) {
    console.error("Admin Middleware - Error:", error);
    const message =
      error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({
      message,
      status: "Error",
    });
  }
};

const checkAuthMiddleware = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("All headers:", req.headers);
    
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return res.status(401).json({
        message: "Access denied. No token provided or invalid format.",
        status: "Error",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);
    console.log("Token length:", token ? token.length : 0);

    // Kiểm tra ACCESS_TOKEN secret
    console.log("ACCESS_TOKEN secret exists:", !!process.env.ACCESS_TOKEN);
    console.log("ACCESS_TOKEN secret length:", process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN.length : 0);

    if (!process.env.ACCESS_TOKEN) {
      console.error("ACCESS_TOKEN environment variable is not set!");
      return res.status(500).json({
        message: "Server configuration error",
        status: "Error",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    console.log("Token decoded successfully:", decoded);

    const user = await Account.findById(decoded.id)
      .populate("permissions")
      .select("-Password");

    console.log("User found:", user ? "Yes" : "No");
    console.log("User ID:", user ? user._id : "N/A");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        message: "User not found",
        status: "Error",
      });
    }

    req.account = user;
    console.log("Auth middleware completed successfully");
    next();
  } catch (error) {
    console.error("=== AUTH MIDDLEWARE ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    let message = "Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Token expired";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token format";
    } else if (error.name === "NotBeforeError") {
      message = "Token not active";
    }
    
    return res.status(401).json({
      message,
      status: "Error",
    });
  }
};

module.exports = {
  checkAdminMiddleware,
  checkAuthMiddleware,
};
