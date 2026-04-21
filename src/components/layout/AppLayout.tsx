import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, LayoutDashboard, Users, PackageOpen, Boxes, FileText } from 'lucide-react';

export function AppLayout() {
  const { logout, email, role, tenantId } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: Users, path: '/customers' },
    { name: 'Catálogo', icon: PackageOpen, path: '/catalog' },
    { name: 'Inventario', icon: Boxes, path: '/inventory' },
    { name: 'Órdenes', icon: FileText, path: '/orders' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Elitista con Transparencias) */}
      <aside className="w-64 glass fixed inset-y-0 left-0 z-40 border-r border-slate-200/50 hidden lg:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100/50">
          <span className="font-bold text-xl text-slate-800 tracking-tight">Applitex</span>
          <span className="ml-2 text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
            {tenantId?.toUpperCase()}
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                  : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100/50">
          <div className="mb-4 px-4 text-xs font-medium text-slate-500 truncate">
            {email} ({role})
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 glass sticky top-0 z-30 border-b border-slate-200/50 flex items-center px-6 lg:px-8">
          {/* Top Bar para Mobile o Breadcrumbs */}
          <div className="text-slate-800 font-semibold">Consola Administrativa</div>
        </header>

        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
