import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/layout/AuthGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { CatalogPage } from '../pages/catalog/CatalogPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import OrdersPage from '../pages/orders/OrdersPage';

// Páginas de marcador de posición temporal para validar arquitectura
const DashboardPlaceholder = () => <div className="text-xl">📊 Dashboard Maquetado</div>;

export function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* RUTAS PRIVADAS SASS (Protegidas por AuthGuard y envueltas en AppLayout) */}
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      {/* RUTA 404 CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
