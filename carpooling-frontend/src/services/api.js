import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout')
};

// Rides APIs (will implement in Phase 12)
export const rides = {
  search: (filters) => api.get('/rides', { params: filters }),
  create: (data) => api.post('/rides', data),
  getById: (id) => api.get(`/rides/${id}`),
  cancel: (id) => api.post(`/rides/${id}/cancel`)
};

// Bookings APIs (will implement in Phase 12)
export const bookings = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  rate: (id, data) => api.post(`/bookings/${id}/rate`, data)
};

// Payments APIs (will implement in Phase 12)
export const payments = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }),
  verify: (data) => api.post('/payments/verify', data)
};

export default api;
