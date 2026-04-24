import api from '../config/api';
import { AxiosRequestConfig } from 'axios';
import { ServiceOrder, ServiceOrderRequest, OrderStatus } from '../types/orders';

export const ordersService = {
  getAll: async (signal?: AbortSignal): Promise<ServiceOrder[]> => {
    // Usamos ruta relativa sin / inicial para que axios la concatene correctamente al baseURL
    const response = await api.get<ServiceOrder[]>('orders', { signal });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<ServiceOrder> => {
    const response = await api.get<ServiceOrder>(`orders/${id}`, { signal });
    return response.data;
  },

  getByCustomer: async (customerId: string, signal?: AbortSignal): Promise<ServiceOrder[]> => {
    const response = await api.get<ServiceOrder[]>(`customers/${customerId}/orders`, { signal });
    return response.data;
  },

  initializeDraft: async (customerId: string): Promise<ServiceOrder> => {
    const response = await api.post<ServiceOrder>(`orders/draft?customerId=${customerId}`);
    return response.data;
  },

  create: async (data: ServiceOrderRequest): Promise<ServiceOrder> => {
    const response = await api.post<ServiceOrder>('orders', data);
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<ServiceOrder> => {
    const response = await api.patch<ServiceOrder>(`orders/${id}/status?status=${status}`);
    return response.data;
  },

  update: async (id: string, data: Partial<ServiceOrderRequest>, config?: AxiosRequestConfig): Promise<ServiceOrder> => {
    const response = await api.put<ServiceOrder>(`orders/${id}`, data, config);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`orders/${id}`);
  },
};
