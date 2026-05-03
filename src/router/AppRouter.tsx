import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/layout/AuthGuard';
import { RoleGuard } from '../components/layout/RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';
import { CatalogPage } from '../pages/catalog/CatalogPage';
import ProductDetailPage from '../pages/catalog/ProductDetailPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import InventoryDetailPage from '../pages/inventory/InventoryDetailPage';
import OrdersPage from '../pages/orders/OrdersPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import UsersPage from '../pages/users/UsersPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import TenantsPage from '../pages/tenants/TenantsPage';
import TenantDetailPage from '../pages/tenants/TenantDetailPage';
import { HealthDashboard } from '../pages/admin/HealthDashboard';
import { ProductionOrdersPage } from '../pages/production/ProductionOrdersPage';
import { ProductionExecutionPage } from '../pages/production/ProductionExecutionPage';
import { ProductionTemplateEditor } from '../pages/production/ProductionTemplateEditor';
import { ProductionTemplatesPage } from '../pages/production/ProductionTemplatesPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';

export function AppRouter() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* RUTAS PRIVADAS SASS (Protegidas por AuthGuard) */}
      <Route element={<AuthGuard />}>
        {/* Ruta de Cambio de Contraseña (sin Layout para ser bloqueante) */}
        <Route path="change-password" element={<ChangePasswordPage />} />

        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalog/:id" element={<ProductDetailPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:id" element={<InventoryDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="production" element={<ProductionOrdersPage />} />
          <Route path="production/execution/:id" element={<ProductionExecutionPage />} />
          <Route path="production/templates" element={<ProductionTemplatesPage />} />
          <Route path="production/templates/new" element={<ProductionTemplateEditor />} />
          <Route path="production/templates/:id" element={<ProductionTemplateEditor />} />
          
          {/* RUTAS SOLO PARA SUPER ADMIN */}
          <Route element={<RoleGuard allowedRoles={['ROLE_SUPER_ADMIN']} />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenants/:id" element={<TenantDetailPage />} />
            <Route path="health" element={<HealthDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* RUTA 404 CATCH-ALL */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
