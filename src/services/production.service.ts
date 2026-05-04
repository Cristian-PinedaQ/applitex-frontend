import api from '../config/api';

export interface DynamicFieldPayload {
  id?: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  required: boolean;
  options?: string[];
}

export interface ProductionTemplatePayload {
  id?: string;
  name: string;
  categoryId?: string;
  productId?: string;
  version?: number;
  fields: DynamicFieldPayload[];
}

export interface ProductionTemplateFilters {
  categoryId?: string;
  productId?: string;
}

export const ProductionService = {
  getTemplates: async (filters?: ProductionTemplateFilters): Promise<ProductionTemplatePayload[]> => {
    const response = await api.get('/production-templates', { params: filters });
    return response.data;
  },

  getTemplateById: async (id: string): Promise<ProductionTemplatePayload> => {
    const response = await api.get(`/production-templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: ProductionTemplatePayload): Promise<ProductionTemplatePayload> => {
    const response = await api.post('/production-templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: ProductionTemplatePayload): Promise<ProductionTemplatePayload> => {
    const response = await api.put(`/production-templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/production-templates/${id}`);
  },

  // --- Service Order Detail ---
  getServiceOrderInfo: async (productionOrderId: string): Promise<any> => {
    const response = await api.get(`/production-orders/${productionOrderId}/service-order`);
    return response.data;
  },

  // --- Órdenes de Producción ---
  getOrders: async (page = 0, size = 10): Promise<any> => {
    const response = await api.get('/production-orders', { params: { page, size } });
    return response.data;
  },

  getOrderById: async (id: string): Promise<any> => {
    const response = await api.get(`/production-orders/${id}`);
    return response.data;
  },

  getLedger: async (id: string, page = 0, size = 5): Promise<any> => {
    const response = await api.get(`/production-orders/${id}/ledger`, { params: { page, size } });
    return response.data;
  },

  consumeItem: async (itemId: string, data: { amount: number; reason: string; idempotencyKey: string; correlationId?: string }) => {
    const response = await api.post(`/production-orders/items/${itemId}/consume`, data);
    return response.data;
  },

  completeProduction: async (id: string, data: { 
    items: { id: string; values: Record<string, any> }[];
    signedBy: string;
    idempotencyKey: string;
    correlationId?: string;
  }) => {
    const response = await api.post(`/production-orders/${id}/complete`, data);
    return response.data;
  },

createOrder: async (data: { serviceOrderId: string; reference?: string }): Promise<any> => {
    const response = await api.post('/production-orders', data);
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/production-orders/${id}`);
  },

cancelOrder: async (id: string): Promise<void> => {
    await api.patch(`/production-orders/${id}/cancel`);
  },

  saveItemReport: async (
    orderId: string,
    itemId: string,
    values: Record<string, any>
  ): Promise<any> => {
    const response = await api.patch(
      `/production-orders/${orderId}/items/${itemId}/report`,
      values
    );
    return response.data;
  },
    
};
