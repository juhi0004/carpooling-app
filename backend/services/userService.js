// User Service
// Handles all user-related business logic
const User = require('../models/User');

class UserService {
  constructor() {
    // In-memory storage (will be replaced with MongoDB)
    this.users = [];
    this.userIdCounter = 1;
  }

  // Get all users
 async getAllUsers() {
  try {
    const users = await User.find();
    return {
      success: true,
      count: users.length,
      users: users,
      message: 'Users retrieved successfully'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


  // Get user by ID
  async getUserById(userId) {
    try {
      // TODO: Query User model
      const user = this.users.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        user: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Validate input
      const { name, email, phone, password } = userData;

      if (!name || !email || !phone || !password) {
        return {
          success: false,
          error: 'Missing required fields: name, email, phone, password',
          statusCode: 400
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Invalid email format',
          statusCode: 400
        };
      }

      // Check if email already exists
      const existingUser = this.users.find(u => u.email === email);
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered',
          statusCode: 400
        };
      }

      // TODO: Hash password before saving

      // Create new user
      const newUser = {
        id: `user-${this.userIdCounter++}`,
        name: name.trim(),
        email: email.toLowerCase(),
        phone: phone,
        password: password, // TODO: Should be hashed
        profilePicture: null,
        bio: '',
        rating: 0,
        ridesCompleted: 0,
        ridesAsDriver: 0,
        joinDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Save to User model
      this.users.push(newUser);

      // Return user without password
      const userResponse = { ...newUser };
      delete userResponse.password;

      return {
        success: true,
        user: userResponse,
        message: 'User created successfully',
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    try {
      const { name, phone, profilePicture, bio } = updateData;

      // Find user
      const user = this.users.find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // Update fields
      if (name) user.name = name.trim();
      if (phone) user.phone = phone;
      if (profilePicture !== undefined) user.profilePicture = profilePicture;
      if (bio !== undefined) user.bio = bio;
      user.updatedAt = new Date();

      // TODO: Save to User model

      return {
        success: true,
        user: user,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const index = this.users.findIndex(u => u.id === userId);
      
      if (index === -1) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // TODO: Delete from User model
      const deletedUser = this.users.splice(index, 1);

      return {
        success: true,
        message: 'User deleted successfully',
        deletedUser: deletedUser.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        bio: user.bio,
        rating: user.rating,
        ridesCompleted: user.ridesCompleted,
        ridesAsDriver: user.ridesAsDriver,
        joinDate: user.joinDate,
        socialLinks: {
          facebook: null,
          twitter: null,
          instagram: null
        }
      };

      return {
        success: true,
        profile: profile,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user settings
  async updateUserSettings(userId, settings) {
    try {
      const { notificationsEnabled, privacyLevel, preferredLanguage, theme } = settings;

      const user = this.users.find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // Create settings object
      const userSettings = {
        userId: userId,
        notificationsEnabled: notificationsEnabled || true,
        privacyLevel: privacyLevel || 'public',
        preferredLanguage: preferredLanguage || 'en',
        theme: theme || 'light',
        updatedAt: new Date()
      };

      // TODO: Save to UserSettings model

      return {
        success: true,
        settings: userSettings,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate user credentials (for login)
  async validateCredentials(email, password) {
    try {
      const user = this.users.find(u => u.email === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
          statusCode: 401
        };
      }

      // TODO: Compare hashed password
      if (user.password !== password) {
        return {
          success: false,
          error: 'Invalid email or password',
          statusCode: 401
        };
      }

      // Return user without password
      const userResponse = { ...user };
      delete userResponse.password;

      return {
        success: true,
        user: userResponse,
        message: 'Credentials valid'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user rating
  async updateUserRating(userId, newRating) {
    try {
      const user = this.users.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      user.rating = newRating;
      user.updatedAt = new Date();

      // TODO: Save to User model

      return {
        success: true,
        user: user,
        message: 'User rating updated'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Increment completed rides
  async incrementCompletedRides(userId, isDriver = false) {
    try {
      const user = this.users.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      if (isDriver) {
        user.ridesAsDriver += 1;
      } else {
        user.ridesCompleted += 1;
      }
      user.updatedAt = new Date();

      // TODO: Save to User model

      return {
        success: true,
        user: user,
        message: 'Ride count updated'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const userService = new UserService();

module.exports = userService;
