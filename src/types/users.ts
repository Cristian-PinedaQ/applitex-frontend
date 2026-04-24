export type UserRole = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_SUPERVISOR' | 'ROLE_OPERATOR';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
}
