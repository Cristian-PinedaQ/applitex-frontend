import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  tenantId: string | null;
  email: string | null;
  role: string | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (token: string, tenantId: string, email: string, role: string, mustChangePassword: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      email: null,
      role: null,
      mustChangePassword: false,
      isAuthenticated: false,

      login: (token, tenantId, email, role, mustChangePassword) => 
        set({ token, tenantId, email, role, mustChangePassword, isAuthenticated: true }),
        
      logout: () => 
        set({ token: null, tenantId: null, email: null, role: null, mustChangePassword: false, isAuthenticated: false }),
    }),
    {
      name: 'applitex-auth-storage', // Key de LocalStorage
    }
  )
);
