import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface RoleGuardProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);

  if (!role || !allowedRoles.includes(role)) {
    console.warn(`🚫 [RoleGuard] Acceso denegado: El rol '${role}' no tiene permiso. Requerido: ${allowedRoles.join(', ')}. Redirigiendo a ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
