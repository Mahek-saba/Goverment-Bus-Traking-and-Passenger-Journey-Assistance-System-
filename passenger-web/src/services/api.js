import axios from 'axios';

// Base API configuration with environment fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid/expired on authenticated routes
      if (window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/notifications')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post('/auth/reset-password', { resetToken, newPassword });
    return response.data;
  },
};

// Bus & Journey Endpoints
export const busApi = {
  searchBuses: async (source, destination) => {
    const response = await api.get('/buses/search', {
      params: { source, destination },
    });
    return response.data;
  },
  getBusDetails: async (tripId) => {
    const encodedId = encodeURIComponent(tripId);
    const response = await api.get(`/buses/${encodedId}`);
    return response.data;
  },
  getTimetable: async (source, destination) => {
    const response = await api.get('/buses/timetable', {
      params: { source, destination },
    });
    return response.data;
  },
  getTracking: async (tripId) => {
    const encodedId = encodeURIComponent(tripId);
    const response = await api.get(`/buses/${encodedId}/tracking`);
    return response.data;
  },
  getETA: async (tripId, destination) => {
    const encodedId = encodeURIComponent(tripId);
    const response = await api.get(`/buses/${encodedId}/eta`, {
      params: destination ? { destination } : {},
    });
    return response.data;
  },
  getAlternatives: async (source, destination, selectedTripId) => {
    const response = await api.get('/buses/alternatives', {
      params: { source, destination, selectedTripId },
    });
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Passenger Endpoints (Notifications & Feedback)
export const passengerApi = {
  getNotifications: async () => {
    const response = await api.get('/passenger/notifications');
    return response.data;
  },
  markNotificationRead: async (id) => {
    const response = await api.patch(`/passenger/notifications/${id}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await api.patch('/passenger/notifications/read-all');
    return response.data;
  },
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/passenger/feedback', feedbackData);
    return response.data;
  },
  getFeedbackList: async (scope = 'all') => {
    const response = await api.get('/passenger/feedback', {
      params: { scope },
    });
    return response.data;
  },
};

export default api;
