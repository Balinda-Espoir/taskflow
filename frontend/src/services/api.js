import axios from 'axios';

// Single source of truth for the backend URL. Set VITE_API_URL per environment.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = new URL(API_URL).origin;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send httpOnly auth cookies
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && !NO_REFRESH.some((p) => original.url?.startsWith(p))) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh').finally(() => { refreshing = null; });
        await refreshing;
        return api(original);
      } catch {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server' : fallback);

export const getFieldErrors = (err) => {
  const out = {};
  for (const d of err?.response?.data?.details || []) if (d?.path) out[d.path] = d.message;
  return out;
};

export default api;
