const { validateSignup, validateLogin } = require('../utils/validators');
const authService = require('../services/authService');
const { ERROR_MESSAGES } = require('../config/constants');

// Signup Controller
const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate input
    const validation = validateSignup({ name, email, phone, password, role });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Call signup service
    const result = await authService.signup({
      name,
      email,
      phone,
      password,
      role: role || 'rider'
    });

    // Return success response
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Call login service
    const result = await authService.login(email, password);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Get Current User
const getMe = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile
};
