const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const validateEnvironment = require("./config/environment");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Validate environment
validateEnvironment();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health Check Routes
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Carpooling API is running!",
    version: "1.0.0",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected";

  res.json({
    success: true,
    status: "✅ Server is healthy",
    timestamp: new Date(),
    services: {
      api: "✅ Running",
      mongodb: mongoStatus,
      blockchain: "✅ Ready",
    },
    config: {
      environment: process.env.NODE_ENV,
      blockchain: process.env.NETWORK_NAME,
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error Handler (Must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("✅ SERVER STARTED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI}`);
  console.log(`🔗 Blockchain: ${process.env.NETWORK_NAME}`);
  console.log(`🔐 Auth: JWT enabled`);
  console.log("=".repeat(60) + "\n");
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("\n📌 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = app;
