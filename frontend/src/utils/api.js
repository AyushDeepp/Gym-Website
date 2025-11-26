import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect automatically - let components handle it
    }
    return Promise.reject(error);
  }
);

// Add cache-busting interceptor for GET requests
api.interceptors.request.use((config) => {
  if (config.method === 'get') {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }
  return config;
});

// Programs
export const getPrograms = () => api.get('/programs');
export const getProgram = (id) => api.get(`/programs/${id}`);

// Trainers
export const getTrainers = () => api.get('/trainers');
export const getTrainer = (id) => api.get(`/trainers/${id}`);

// Plans
export const getPlans = () => api.get('/plans');
export const getPlan = (id) => api.get(`/plans/${id}`);

// Timetable
export const getTimetable = () => api.get('/timetable');
export const getTimetableByDay = (day) => api.get(`/timetable/day/${day}`);

// Contact
export const submitContact = (data) => api.post('/contact', data);

// Payments
export const createPaymentOrder = (data) => api.post('/payments/create', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);

// User Authentication
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const googleAuth = (data) => api.post('/users/google', data);
export const getCurrentUser = () => api.get('/users/me');
export const updateUserProfile = (data) => api.put('/users/profile', data);

// Membership
export const getMembershipStatus = (userId) => api.get(`/membership/status/${userId}`);
export const renewMembership = (userId, data) => api.put(`/membership/renew/${userId}`, data);

export default api;

