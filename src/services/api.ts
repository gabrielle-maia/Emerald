// src/services/api.ts
import axios from 'axios';

// Configure base URL — replace with your real backend URL when ready
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.emerald.app/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attaches auth token
api.interceptors.request.use(
  async (config) => {
    // TODO: get token from secure store
    // const token = await SecureStore.getItemAsync('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      console.warn('[API] Unauthorized — redirecting to login');
    }
    return Promise.reject(error);
  }
);

// ─── PRODUCT SERVICE ───────────────────────────────────────────────────────────
// These are ready for real backend, but use mock data for now.
// Each function is named identically to its future API call.

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  search: (query: string, filters?: object) =>
    api.get('/products/search', { params: { q: query, ...filters } }),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (categoryId: string) =>
    api.get(`/products?category=${categoryId}`),
  getSimilar: (productId: string) =>
    api.get(`/products/${productId}/similar`),
};

// ─── ORDER SERVICE ─────────────────────────────────────────────────────────────
export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: object) => api.post('/orders', data),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// ─── AUTH SERVICE ──────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  refreshToken: (token: string) =>
    api.post('/auth/refresh', { token }),
  logout: () => api.post('/auth/logout'),
};

// ─── USER SERVICE ──────────────────────────────────────────────────────────────
export const userService = {
  getProfile: () => api.get('/me'),
  updateProfile: (data: object) => api.patch('/me', data),
  getAddresses: () => api.get('/me/addresses'),
  addAddress: (data: object) => api.post('/me/addresses', data),
  deleteAddress: (id: string) => api.delete(`/me/addresses/${id}`),
};
