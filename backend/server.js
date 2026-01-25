const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
try {
  // Working routes
  const authRoutes = require('./routes/auth');
  const tripRoutes = require('./routes/trips');
  const paymentRoutes = require('./routes/payments');
  const notificationRoutes = require('./routes/notifications');
  
  app.use('/api/users', authRoutes);
  console.log('✅ Auth routes loaded');
  
  app.use('/api/trips', tripRoutes);
  console.log('✅ Trip routes loaded');
  
  app.use('/api/payments', paymentRoutes);
  console.log('✅ Payment routes loaded');
  
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded');
  
  //TODO: Uncomment when ready to implement
  const userRoutes = require('./routes/users');
  app.use('/api/accounts', userRoutes);
  console.log('✅ User routes loaded');
  
  const walletRoutes = require('./routes/wallets');
  app.use('/api/wallets', walletRoutes);
  console.log('✅ Wallet routes loaded');
  
} catch (error) {
  console.error('❌ Route loading error:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Carpooling API',
    status: 'running',
    version: '1.0.0',
    database: 'connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('⚠️  Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║  🚀 Carpooling API Server Started  ║`);
  console.log(`║  Port: ${PORT}                          ║`);
  console.log(`║  Status: Ready                      ║`);
  console.log(`╚════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
