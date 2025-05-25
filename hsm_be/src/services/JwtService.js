const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// const generateAccessToken = async (payload) => {
//   console.log("Generating access token for payload:", payload);
//   const access_token = jwt.sign(
//     { id: payload.id },
//     process.env.ACCESS_TOKEN,
//     { expiresIn: "15m" }
//   );
//   return access_token;
// };

const generateAccessToken = async (payload) => {
  console.log("=== GENERATING ACCESS TOKEN ===");
  console.log("Payload:", payload);
  console.log("ACCESS_TOKEN secret exists:", !!process.env.ACCESS_TOKEN);
  
  if (!process.env.ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN environment variable is not set");
  }
  
  if (!payload || !payload.id) {
    throw new Error("Invalid payload for token generation");
  }
  
  const access_token = jwt.sign(
    { id: payload.id },
    process.env.ACCESS_TOKEN,
    { expiresIn: "15m" }
  );
  
  console.log("Generated token:", access_token);
  console.log("Generated token length:", access_token.length);
  
  return access_token;
};

const generateRefreshToken = async (payload) => {
  console.log("Generating refresh token for payload:", payload);
  const refresh_token = jwt.sign(
    { id: payload.id },
    process.env.REFRESH_TOKEN,
    { expiresIn: "365d" }
  );
  return refresh_token;
};

const refreshTokenJwtService = async (token) => {
  try {
    if (!token) {
      return {
        status: "ERR",
        message: "No token provided",
      };
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) {
          console.error("Refresh token verification error:", err);
          return resolve({
            status: "ERR",
            message: err.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token",
          });
        }
        resolve({ status: "OK", user });
      });
    });

    if (decoded.status === "ERR") {
      return decoded;
    }

    const access_token = await generateAccessToken({
      id: decoded.user.id,
    });

    return {
      status: "OK",
      message: "Token refreshed successfully",
      access_token,
    };
  } catch (e) {
    console.error("Unexpected error in refreshTokenJwtService:", e);
    return {
      status: "ERR",
      message: "Failed to refresh token",
    };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshTokenJwtService,
};