const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ===== DATABASE CONNECTION =====
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ===== ROUTES =====
try {
  // Load auth routes (this is required for Phase 8)
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
  
  // Phase 9+ routes (only if files have valid controllers)
  // Uncomment these when you've created the corresponding controllers
  
  // const tripRoutes = require('./routes/trips');
  // app.use('/api/trips', tripRoutes);
  // console.log('✅ Trip routes loaded');
  
  // const paymentRoutes = require('./routes/payments');
  // app.use('/api/payments', paymentRoutes);
  // console.log('✅ Payment routes loaded');
  
  // const notificationRoutes = require('./routes/notifications');
  // app.use('/api/notifications', notificationRoutes);
  // console.log('✅ Notification routes loaded');
  
  // const userRoutes = require('./routes/users');
  // app.use('/api/accounts', userRoutes);
  // console.log('✅ User routes loaded');
  
  // const walletRoutes = require('./routes/wallets');
  // app.use('/api/wallets', walletRoutes);
  // console.log('✅ Wallet routes loaded');
  
} catch (error) {
  console.error('❌ Route loading error:', error.message);
  process.exit(1);
}

// ===== HEALTH CHECK =====
app.get('/', (req, res) => {
  res.json({
    message: 'Carpooling API',
    status: 'running',
    version: '1.0.0',
    database: 'connected'
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('⚠️  Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║  🚀 Carpooling API Server Started  ║`);
  console.log(`║  Port: ${PORT}                          ║`);
  console.log(`║  Status: Ready                      ║`);
  console.log(`╚════════════════════════════════════╝\n`);
  console.log(`📌 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📌 Base URL: http://localhost:${PORT}\n`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// ===== UNHANDLED REJECTIONS =====
process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;