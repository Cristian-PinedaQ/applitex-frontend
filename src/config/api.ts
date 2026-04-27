import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// UUID v4 compatible sin depender de crypto.randomUUID (funciona en HTTP y HTTPS)
function generateUUID(): string {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
    const n = parseInt(c);
    return (
      n ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))
    ).toString(16);
  });
}

// Aseguramos que la URL termine en /
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl : `${rawApiUrl}/`;

console.log('🌐 [API] Base URL (normalized):', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición (Token + Request-ID)
api.interceptors.request.use(
  (config) => {
    // ID único usando generateUUID en vez de uuidv4
    const requestId = generateUUID();

    config.headers['X-Request-ID'] = requestId;

    // Normalizar URL relativa
    if (config.url?.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `🚀 [API] Request: ${config.method?.toUpperCase()} ${fullUrl} [ID: ${requestId}]`
    );

    // Token auth
    const { token } = useAuthStore.getState();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta (Manejo global de errores)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const requestId = error.config?.headers?.['X-Request-ID'];

    if (error.response) {
      console.error(
        `❌ [API] Error ${error.response.status} [ID: ${requestId}]:`,
        error.response.data
      );
    } else {
      console.error(
        `❌ [API] Network/Unknown Error [ID: ${requestId}]:`,
        error.message
      );
    }

    // Manejo de sesión expirada
    if (error.response && error.response.status === 401) {
      console.error(
        '🛡️ [API] 401 Unauthorized detected. Logging out and redirecting to /login'
      );
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Manejo de cambio de contraseña obligatorio (Security Enforcement)
    if (error.response && error.response.status === 403 && error.response.data?.error === 'PASSWORD_CHANGE_REQUIRED') {
      console.warn('🔐 [API] 403 Password Change Required. Redirecting to /change-password');
      window.location.href = '/change-password';
    }

    return Promise.reject(error);
  }
);

export default api;