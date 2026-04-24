import api from '../config/api';
import { User, UserRequest } from '../types/users';

export const usersService = {
  getAll: async (signal?: AbortSignal): Promise<User[]> => {
    const response = await api.get('/users', { signal });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<User> => {
    const response = await api.get(`/users/${id}`, { signal });
    return response.data;
  },

  create: async (user: UserRequest): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  update: async (id: string, user: UserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
