import api from '../config/api';
import { ServiceOrder, ServiceOrderRequest, OrderStatus } from '../types/orders';

export const ordersService = {
  getAll: async (): Promise<ServiceOrder[]> => {
    const response = await api.get<ServiceOrder[]>('/orders');
    return response.data;
  },

  getById: async (id: string): Promise<ServiceOrder> => {
    const response = await api.get<ServiceOrder>(`/orders/${id}`);
    return response.data;
  },

  getByCustomer: async (customerId: string): Promise<ServiceOrder[]> => {
    const response = await api.get<ServiceOrder[]>(`/customers/${customerId}/orders`);
    return response.data;
  },

  create: async (data: ServiceOrderRequest): Promise<ServiceOrder> => {
    const response = await api.post<ServiceOrder>('/orders', data);
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<ServiceOrder> => {
    const response = await api.patch<ServiceOrder>(`/orders/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};
