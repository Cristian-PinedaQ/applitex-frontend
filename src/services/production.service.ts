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
  }
};
