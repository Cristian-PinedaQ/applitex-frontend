import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Aseguramos que la URL termine en / para que axios concatene correctamente las rutas relativas
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl : `${rawApiUrl}/`;

console.log('🌐 [API] Base URL (normalized):', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición (Inyectar Token y Request-ID Automáticamente)
api.interceptors.request.use(
  (config) => {
    // Generar un ID único para trazabilidad End-to-End
    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;

    // Si la ruta empieza con /, axios la tratará como absoluta desde el host, 
    // así que la convertimos a relativa si es necesario para que use el baseURL correctamente.
    if (config.url?.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 [API] Request: ${config.method?.toUpperCase()} ${fullUrl} [ID: ${requestId}]`);
    
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

// Interceptor de Respuesta (Manejo Global de Errores)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si la petición fue cancelada intencionalmente, no la tratamos como error de logs
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const requestId = error.config?.headers?.['X-Request-ID'];
    if (error.response) {
      console.error(`❌ [API] Error ${error.response.status} [ID: ${requestId}]:`, error.response.data);
    } else {
      console.error(`❌ [API] Network/Unknown Error [ID: ${requestId}]:`, error.message);
    }

    if (error.response && error.response.status === 401) {
      console.error('🛡️ [API] 401 Unauthorized detected. Logging out and redirecting to /login');
      useAuthStore.getState().logout();
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
