const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    
    // Profile Information
    profilePicture: {
      type: String,
      default: null
    },
    
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    
    // Rating and Reviews
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    
    // Ride Statistics
    ridesCompleted: {
      type: Number,
      default: 0,
      min: [0, 'Rides completed cannot be negative']
    },
    
    ridesAsDriver: {
      type: Number,
      default: 0,
      min: [0, 'Rides as driver cannot be negative']
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    
    joinDate: {
      type: Date,
      default: Date.now
    },
    
    // User Settings
    settings: {
      notificationsEnabled: {
        type: Boolean,
        default: true
      },
      privacyLevel: {
        type: String,
        enum: ['public', 'private', 'friends-only'],
        default: 'public'
      },
      preferredLanguage: {
        type: String,
        default: 'en'
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    
    // Social Links
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// Virtual for user's full display
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Method to return user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create Model
const User = mongoose.model('User', userSchema);

module.exports = User;
