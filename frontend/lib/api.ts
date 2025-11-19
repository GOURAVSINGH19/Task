import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; email?: string }) =>
    api.put('/profile', data),
};

export const taskAPI = {
  getAll: (params?: { status?: string; priority?: string; search?: string }) =>
    api.get('/tasks', { params }),
  get: (id: number) => api.get(`/tasks/${id}`),
  create: (data: { title: string; description?: string; status?: string; priority?: string }) =>
    api.post('/tasks', data),
  update: (id: number, data: { title?: string; description?: string; status?: string; priority?: string }) =>
    api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export default api;

