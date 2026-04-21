import api from '../config/api';
import { Customer, CustomerRequest } from '../types/customer';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
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
