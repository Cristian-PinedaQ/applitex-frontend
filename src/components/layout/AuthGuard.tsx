import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Si no está autenticado, Expulsado al Login inmediatamente.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // De lo contrario, dejarlo pasar al Router anidado
  return <Outlet />;
}
