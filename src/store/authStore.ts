import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  tenantId: string | null;
  email: string | null;
  role: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (token: string, tenantId: string, email: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      email: null,
      role: null,
      isAuthenticated: false,

      login: (token, tenantId, email, role) => 
        set({ token, tenantId, email, role, isAuthenticated: true }),
        
      logout: () => 
        set({ token: null, tenantId: null, email: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'applitex-auth-storage', // Key de LocalStorage
    }
  )
);
