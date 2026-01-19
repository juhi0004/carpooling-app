/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("\n❌ ERROR CAUGHT:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("---\n");

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern);
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: "DUPLICATE_ENTRY",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
