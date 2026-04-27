import api from "../config/api";

export interface Tenant {
  id: string;
  name: string;
  status: "ACTIVE" | "DELETED";
  adminEmail: string;
  createdAt: string;
}

export interface TenantCreateRequest {
  id: string;
  name: string;
  adminEmail: string;
  password?: string;
  status?: "ACTIVE" | "DELETED";
}

export const tenantsService = {
  getAll: async (signal?: AbortSignal) => {
    const response = await api.get<Tenant[]>("/tenants", { signal });
    return response.data;
  },

  getById: async (id: string, signal?: AbortSignal) => {
    const response = await api.get<Tenant>(`/tenants/${id}`, { signal });
    return response.data;
  },

  create: async (data: TenantCreateRequest) => {
    const response = await api.post<Tenant>("/tenants", data);
    return response.data;
  },

  update: async (id: string, data: { name: string; status?: string; adminEmail?: string; password?: string }) => {
    const response = await api.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/tenants/${id}`);
  },

  activate: async (id: string) => {
    await api.patch(`/tenants/${id}/activate`);
  }
};
