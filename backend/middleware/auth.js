const jwt = require("jsonwebtoken");
const { ERROR_MESSAGES } = require("../config/constants");

/**
 * JWT Authentication Middleware
 * Verifies token and adds user info to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided - Please login",
        code: "NO_TOKEN",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.userId = decoded.id;
    req.userRole = decoded.role;

    console.log(`✅ Auth verified for user: ${req.userId} (${req.userRole})`);

    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
