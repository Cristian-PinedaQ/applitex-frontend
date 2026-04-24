import api from '../config/api';
import { Customer, CustomerRequest } from '../types/customer';

export const customerService = {
  getAll: async (signal?: AbortSignal): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers', { signal });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`, { signal });
    return response.data;
  },

  create: async (data: CustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: CustomerRequest): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
