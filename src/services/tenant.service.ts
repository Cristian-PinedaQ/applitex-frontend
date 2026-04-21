import api from '../config/api';

export interface TenantDTO {
  id: string;
  name: string;
  createdAt: string;
}

export interface TenantRequestDTO {
  id: string;
  name: string;
}

export const TenantService = {
  getAll: async (): Promise<TenantDTO[]> => {
    const response = await api.get('/tenants');
    return response.data;
  },

  getById: async (id: string): Promise<TenantDTO> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  update: async (id: string, data: TenantRequestDTO): Promise<TenantDTO> => {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  }
};
