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
  version?: number;
  fields: DynamicFieldPayload[];
}

export const ProductionService = {
  getTemplates: async (): Promise<ProductionTemplatePayload[]> => {
    const response = await api.get('/production-templates');
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

  // --- Órdenes de Producción ---
  getOrders: async (page = 0, size = 10): Promise<any> => {
    const response = await api.get('/production', { params: { page, size } });
    return response.data;
  },

  getOrderById: async (id: string): Promise<any> => {
    const response = await api.get(`/production/${id}`);
    return response.data;
  },

  getLedger: async (id: string, page = 0, size = 5): Promise<any> => {
    const response = await api.get(`/production/${id}/ledger`, { params: { page, size } });
    return response.data;
  },

  consumeItem: async (itemId: string, data: { amount: number; reason: string; idempotencyKey: string; correlationId?: string }) => {
    const response = await api.post(`/production/items/${itemId}/consume`, data);
    return response.data;
  },

  completeProduction: async (id: string, data: { 
    templateId: string; 
    values: Record<string, any>;
    signedBy: string;
    idempotencyKey: string;
    correlationId?: string;
  }) => {
    const response = await api.post(`/production/${id}/complete`, data);
    return response.data;
  },

  createOrder: async (data: { serviceOrderId: string; reference?: string }): Promise<any> => {
  const response = await api.post('/production', data);
  return response.data;
}
  
};
