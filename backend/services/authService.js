const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Signup service
const signup = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw {
        status: 400,
        message: ERROR_MESSAGES.EMAIL_EXISTS
      };
    }

    // Create new user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || 'rider'
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user and token (without password)
    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      user: user.toJSON(),
      token
    };
  } catch (error) {
    throw error;
  }
};

// Login service
const login = async (email, password) => {
  try {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw {
        status: 401,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      };
    }

    // Compare password
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      throw {
        status: 401,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      };
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user and token (without password)
    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      user: user.toJSON(),
      token
    };
  } catch (error) {
    throw error;
  }
};

// Get current user
const getCurrentUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw {
        status: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    return {
      success: true,
      user: user.toJSON()
    };
  } catch (error) {
    throw error;
  }
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  try {
    // Don't allow password update here
    delete updateData.password;
    delete updateData.email; // Email shouldn't be updated easily

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw {
        status: 404,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      user: user.toJSON()
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  signup,
  login,
  getCurrentUser,
  updateProfile
};
