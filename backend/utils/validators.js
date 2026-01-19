// Email validation
const isValidEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Phone validation
const isValidPhone = (phone) => {
  // 10 digits only (for India)
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

// Name validation
const isValidName = (name) => {
  // At least 2 characters, no special characters
  const regex = /^[a-zA-Z\s]{2,}$/;
  return regex.test(name);
};

// Signup validation
const validateSignup = (data) => {
  const errors = {};

  if (!data.name || !isValidName(data.name)) {
    errors.name = 'Please provide a valid name (2+ characters, letters only)';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email';
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!data.role || !['driver', 'rider', 'admin'].includes(data.role)) {
    errors.role = 'Role must be driver, rider, or admin';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login validation
const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email';
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Please provide a password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  validateSignup,
  validateLogin
};
