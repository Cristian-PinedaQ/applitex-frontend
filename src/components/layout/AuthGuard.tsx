import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthGuard() {
  const { isAuthenticated, mustChangePassword } = useAuthStore();
  const location = useLocation();

  // 1. Si no está autenticado, Expulsado al Login inmediatamente.
  if (!isAuthenticated) {
    console.warn('🛡️ [AuthGuard] Acceso denegado: Usuario no autenticado. Redirigiendo a /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si debe cambiar contraseña y NO está en la ruta de cambio, forzar redirección
  if (mustChangePassword && location.pathname !== '/change-password') {
    console.warn('🔐 [AuthGuard] Cambio de contraseña obligatorio requerido. Redirigiendo a /change-password');
    return <Navigate to="/change-password" replace />;
  }

  // 3. De lo contrario, dejarlo pasar al Router anidado
  return <Outlet />;
}
