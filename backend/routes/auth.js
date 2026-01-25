const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  logout,
  updateProfile
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/logout', verifyToken, logout);

module.exports = router;
