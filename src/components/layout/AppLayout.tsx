import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Drawer } from 'vaul';
import { 
  LayoutDashboard, 
  UserCheck, 
  PackageOpen, 
  Boxes, 
  FileText, 
  LogOut, 
  Users as TeamIcon, 
  Building2, 
  Menu,
  Factory,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';
import logo from '../../assets/logo.png';

export function AppLayout() {
  const { logout, email, role, tenantId } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Activar restauración de scroll global
  useScrollRestoration();

  // Cerrar menú automáticamente al cambiar de ruta o al pasar a desktop
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, isDesktop]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: UserCheck, path: '/customers' },
    { name: 'Catálogo', icon: PackageOpen, path: '/catalog' },
    { name: 'Inventario', icon: Boxes, path: '/inventory' },
    { name: 'Órdenes', icon: FileText, path: '/orders' },
    { name: 'Producción', icon: Factory, path: '/production' },
  ];

  if (role === 'ROLE_SUPER_ADMIN') {
    menu.push({ name: 'Equipo', icon: TeamIcon, path: '/users' });
    if (tenantId === 'master') {
      menu.push({ name: 'Empresas', icon: Building2, path: '/tenants' });
      menu.push({ name: 'Salud Sistema', icon: Activity, path: '/health' });
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/50">
      <div className="h-24 flex items-center px-6 border-b border-slate-100/50 shrink-0 gap-4">
        <img src={logo} alt="Applitex Logo" className="w-14 h-14 object-contain drop-shadow-xl" />
        <div className="flex flex-col">
          <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter leading-none">Applitex</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Textile Pro</span>
        </div>
        <span className="ml-auto text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 uppercase">
          {tenantId}
        </span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100/50 shrink-0 space-y-4">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Usuario</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 transition-all active:scale-95 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dynamic bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row font-serif">
      
      {/* Mobile Drawer (vía Vaul) */}
      <Drawer.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} direction="left">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 animate-in fade-in duration-300" />
          <Drawer.Content className="fixed bottom-0 left-0 top-0 w-[280px] z-50 outline-none flex">
            {/* El Drawer gestiona su propio Safe Area para ser independiente */}
            <div className="flex-1 h-full shadow-2xl animate-in slide-in-from-left duration-300 pb-safe pt-safe overflow-y-auto">
              <SidebarContent />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="w-72 hidden lg:block fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Responsive Header */}
        <header className="h-16 h-dynamic max-h-16 glass dark:glass-dark sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.currentTarget.blur();
                setIsMobileMenuOpen(true);
              }}
              className="lg:hidden p-3 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 transition-all"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Applitex Logo" className="w-9 h-9 object-contain drop-shadow-sm lg:hidden" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1.5">Módulo de Gestión</span>
                <span className="text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">SyncCore <span className="text-slate-400 font-medium">v1.2</span></span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                <Activity className="w-5 h-5 text-indigo-500" />
             </div>
          </div>
        </header>

        {/* Contenedor de Contenido con Safe Area único */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-safe">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
