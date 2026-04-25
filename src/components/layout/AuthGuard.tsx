import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Si no está autenticado, Expulsado al Login inmediatamente.
  if (!isAuthenticated) {
    console.warn('🛡️ [AuthGuard] Acceso denegado: Usuario no autenticado. Redirigiendo a /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // De lo contrario, dejarlo pasar al Router anidado
  return <Outlet />;
}
