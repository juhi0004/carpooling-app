/**
 * Application Constants & Enums
 */

// Payment Status
const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Trip Status
const TRIP_STATUS = {
  CREATED: "created",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// User Roles
const USER_ROLES = {
  DRIVER: "driver",
  PASSENGER: "passenger",
  BOTH: "both",
};

// Passenger Status in Trip
const PASSENGER_STATUS = {
  INVITED: "invited",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

// Trip Constraints
const TRIP_CONSTRAINTS = {
  MIN_PASSENGERS: 1,
  MAX_PASSENGERS: 4,
  MIN_DISTANCE: 1, // km
  MAX_DISTANCE: 1000, // km
  MIN_FARE: 50, // INR
  MAX_FARE: 10000, // INR
};

// Fees
const FEES = {
  RAZORPAY_PERCENTAGE: 2.36, // Razorpay charges 2.36%
  PLATFORM_PERCENTAGE: 0, // Platform fee
};

// Authentication
const AUTH = {
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  PHONE_REGEX: /^[0-9]{10}$/, // 10 digit Indian phone
  EMAIL_REGEX: /^\S+@\S+\.\S+$/, // Basic email validation
};

// Pagination
const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// Rating
const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 5.0,
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized - Please login",
  FORBIDDEN: "Forbidden - You don't have permission",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input data",
  SERVER_ERROR: "Server error - Please try again later",
  DUPLICATE_EMAIL: "Email already exists",
  DUPLICATE_PHONE: "Phone number already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_EXPIRED: "Token has expired",
};

// Success Messages
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  TRIP_CREATED: "Trip created successfully",
  PAYMENT_PROCESSED: "Payment processed successfully",
};

module.exports = {
  PAYMENT_STATUS,
  TRIP_STATUS,
  USER_ROLES,
  PASSENGER_STATUS,
  TRIP_CONSTRAINTS,
  FEES,
  AUTH,
  PAGINATION,
  RATING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
