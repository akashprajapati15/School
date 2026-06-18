import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
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

// Response interceptor to handle authorization errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Avoid redirecting on active login routes
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register/student' && currentPath !== '/register/teacher') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoint wrappers
export const authAPI = {
  registerTeacher: (data) => api.post('/auth/register-teacher', data),
  registerStudent: (data) => api.post('/auth/register-student', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const clubAPI = {
  create: (data) => api.post('/clubs', data),
  getAll: () => api.get('/clubs'),
  getById: (id) => api.get(`/clubs/${id}`),
  update: (id, data) => api.put(`/clubs/${id}`, data),
  assignTeacher: (id, teacherId) => api.post(`/clubs/${id}/assign-teacher`, { teacherId }),
  delete: (id) => api.delete(`/clubs/${id}`),
};

export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getPending: () => api.get('/teachers/pending'),
  updateStatus: (id, status) => api.put(`/teachers/${id}/status`, { status }),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  remove: (id) => api.delete(`/students/${id}`),
};

export const requestAPI = {
  requestToJoin: (clubId) => api.post(`/join-requests/${clubId}`),
  getAllPending: () => api.get('/join-requests'),
  updateStatus: (id, status) => api.put(`/join-requests/${id}`, { status }),
  getClubMembers: (clubId) => api.get(`/join-requests/club/${clubId}/members`),
  removeMember: (clubId, studentId) => api.delete(`/join-requests/club/${clubId}/student/${studentId}`),
};

export const postAPI = {
  create: (clubId, formData) =>
    api.post(`/posts/${clubId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getClubPosts: (clubId) => api.get(`/posts/club/${clubId}`),
  getAll: () => api.get('/posts'),
  delete: (id) => api.delete(`/posts/${id}`),
};

export const likeAPI = {
  toggle: (postId) => api.post(`/likes/${postId}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const activityAPI = {
  getAll: () => api.get('/activity-logs'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
