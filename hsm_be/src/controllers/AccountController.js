const AccountService = require("../services/AccountService");
const { refreshTokenJwtService } = require("../services/JwtService");

exports.loginAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", { email });

    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "Email and password are required.",
      });
    }
    if (!mailformat.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format.",
      });
    }

    const result = await AccountService.loginAccount(req.body);
    if (result.status === "ERR") {
      return res.status(401).json(result);
    }

    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    console.log("Login successful:", { userId: result.data.id, access_token: result.access_token });
    return res.status(200).json({
      status: "OK",
      message: "Login successful",
      access_token: result.access_token,
      data: result.data,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Login failed",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    console.log("Refresh token request:", { refresh_token });
    const result = await refreshTokenJwtService(refresh_token);
    if (result.status === "ERR") {
      return res.status(401).json(result);
    }
    return res.status(200).json({
      status: "OK",
      message: "Token refreshed successfully",
      access_token: result.access_token,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Failed to refresh token",
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await AccountService.requestPasswordReset(email);
    res.status(200).json({ status: "Success", ...result });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const result = await AccountService.resetPassword(token, newPassword);
    res.status(200).json({ status: "Success", ...result });
  } catch (err) {
    res.status(400).json({ status: "Error", message: err.message });
  }
};

// exports.getProfile = async (req, res) => {
//   try {
//     if (!req.account) {
//       return res.status(401).json({
//         status: "Error",
//         message: "Unauthorized",
//       });
//     }
//     const accountId = req.account._id;
//     console.log("Get profile request for accountId:", accountId);
//     const profileData = await AccountService.getProfile(accountId);
//     res.status(200).json({
//       status: "Success",
//       message: "Get profile successfully",
//       data: profileData,
//     });
//   } catch (err) {
//     console.error("Get profile error:", err);
//     res.status(500).json({ status: "Error", message: err.message });
//   }
// };

exports.getProfile = async (req, res) => {
    try {
        const userId = req.account._id;
        const profile = await AccountService.getProfile(userId);
        return res.status(200).json({
            message: "Profile fetched successfully",
            data: profile,
            status: "Success",
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
            status: "Error",
        });
    }
};

exports.updateProfile = async (req, res) => {
  try {
    const accountId = req.account._id;
    const data = req.body;
    const responseData = await AccountService.updateProfile(accountId, data);
    res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      data: responseData,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errorMessage = Object.values(err.errors)[0].message;
      return res.status(400).json({ status: "Error", message: errorMessage });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: "Error",
        message: `${field} already exists`,
      });
    }
    res.status(500).json({ status: "Error", message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const accountId = req.account._id;
    const passwordData = req.body;
    const result = await AccountService.changePassword(accountId, passwordData);
    res.status(200).json({ status: "Success", ...result });
  } catch (err) {
    res.status(400).json({ status: "Error", message: err.message });
  }
};