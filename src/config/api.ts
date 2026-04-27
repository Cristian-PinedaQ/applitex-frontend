import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { v4 as uuidv4 } from 'uuid';

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
    // ID único PRO (UUID estándar)
    const requestId = uuidv4();

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

    return Promise.reject(error);
  }
);

export default api;