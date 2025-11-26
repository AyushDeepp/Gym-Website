import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAdmin = (data) => api.post('/admin/auth/login', data);
export const getMe = () => api.get('/admin/auth/me');
export const registerAdmin = (data) => api.post('/admin/auth/register', data);
export const getAdmins = () => api.get('/admin/auth/admins');
export const updateAdmin = (id, data) => api.put(`/admin/auth/admins/${id}`, data);
export const deleteAdmin = (id) => api.delete(`/admin/auth/admins/${id}`);

// Programs
export const getPrograms = () => api.get('/programs');
export const getProgram = (id) => api.get(`/programs/${id}`);
export const createProgram = (data) => api.post('/programs', data);
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data);
export const deleteProgram = (id) => api.delete(`/programs/${id}`);

// Trainers
export const getTrainers = () => api.get('/trainers');
export const getTrainer = (id) => api.get(`/trainers/${id}`);
export const createTrainer = (data) => api.post('/trainers', data);
export const updateTrainer = (id, data) => api.put(`/trainers/${id}`, data);
export const deleteTrainer = (id) => api.delete(`/trainers/${id}`);

// Plans
export const getPlans = () => api.get('/plans');
export const getPlan = (id) => api.get(`/plans/${id}`);
export const createPlan = (data) => api.post('/plans', data);
export const updatePlan = (id, data) => api.put(`/plans/${id}`, data);
export const deletePlan = (id) => api.delete(`/plans/${id}`);

// Timetable
export const getTimetable = () => api.get('/timetable');
export const getTimetableByDay = (day) => api.get(`/timetable/day/${day}`);
export const createTimetable = (data) => api.post('/timetable', data);
export const updateTimetable = (id, data) => api.put(`/timetable/${id}`, data);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`);

// Contact
export const getContacts = () => api.get('/contact');
export const getContact = (id) => api.get(`/contact/${id}`);
export const updateContact = (id, data) => api.put(`/contact/${id}`, data);

// Payments
export const getPayments = () => api.get('/payments/all');
export const getPayment = (id) => api.get(`/payments/${id}`);

// Customers
export const getCustomers = (params) => api.get('/admin/customers', { params });
export const getCustomerById = (id) => api.get(`/admin/customers/${id}`);
export const updateCustomerRole = (id, data) => api.put(`/admin/customers/${id}/update-role`, data);
export const updateCustomerMembership = (id, data) => api.put(`/admin/customers/${id}/membership`, data);
export const getCustomerPayments = (id, params) => api.get(`/admin/customers/${id}/payments`, { params });
export const updateCustomerNotes = (id, data) => api.put(`/admin/customers/${id}/notes`, data);
export const assignTrainer = (id, data) => api.put(`/admin/customers/${id}/assign-trainer`, data);
export const deleteCustomer = (id) => api.delete(`/admin/customers/${id}`);

export default api;

