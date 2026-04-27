import api from '../config/api';

export interface LoginPayload {
  tenantId: string;
  email: string;
  password: string;
}

export interface RegisterTenantPayload extends LoginPayload {
  tenantName: string;
}

export interface AuthResponse {
  token: string;
  tenantId: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

export const AuthService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  registerTenant: async (data: RegisterTenantPayload): Promise<AuthResponse> => {
    // Adapter to backend dto
    const payload = {
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      ownerEmail: data.email,
      ownerPassword: data.password,
    };
    const response = await api.post('/auth/register-tenant', payload);
    return response.data;
  }
};
