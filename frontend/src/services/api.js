import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Prevent browser caching for GET requests
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
  }
  
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role }),
  logout: () => api.post('/auth/logout'),
  register: (userData) => api.post('/auth/register', userData),
  verifyPassword: (password) => api.post('/auth/verify-password', { password })
};

// Students API
export const studentAPI = {
  getAll: () => api.get(`/students?_t=${Date.now()}`),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  levelUp: (id, data) => api.put(`/students/${id}/level-up`, data),
  delete: (id) => api.delete(`/students/${id}`)
};

// Staff API
export const staffAPI = {
  getAll: () => api.get(`/staff?_t=${Date.now()}`),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`)
};

// Sessions API
export const sessionAPI = {
  getAll: () => api.get(`/sessions?_t=${Date.now()}`),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  addStudent: (data) => api.post('/sessions/add-student', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`)
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  getBySession: (sessionId) => api.get(`/attendance/session/${sessionId}`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  mark: (data) => api.post('/attendance/mark', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`)
};

// Fees API
export const feesAPI = {
  getAll: () => api.get('/fees'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  create: (data) => api.post('/fees', data),
  recordPayment: (id, data) => api.post(`/fees/${id}/payment`, data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`)
};

// Reports API
export const reportAPI = {
  getSales: (period) => api.get(`/reports/sales?period=${period}`),
  save: (data) => api.post('/reports', data),
  getHistory: () => api.get('/reports/history')
};

// Courses API
export const courseAPI = {
  getAll: () => api.get(`/courses?_t=${Date.now()}`),
  create: (data) => api.post('/courses', data),
  delete: (id) => api.delete(`/courses/${id}`)
};

export default api;
