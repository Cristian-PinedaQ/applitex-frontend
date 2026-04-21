import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición (Inyectar Token Automáticamente)
api.interceptors.request.use(
  (config) => {
    // Leemos directo desde el estado global de Zustand
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
    // Si el backend envía 401 (Token Expirado o Inválido), cerramos sesión automáticamente
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Forzamos expulsión al Frontend
    }
    return Promise.reject(error);
  }
);

export default api;
