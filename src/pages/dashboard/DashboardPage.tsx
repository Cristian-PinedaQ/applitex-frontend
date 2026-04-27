import { 
  TrendingUp, 
  Users, 
  Package, 
  Factory, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const stats = [
    { 
      label: 'Ventas del Mes', 
      value: '$124.8M', 
      trend: '+12.5%', 
      trendUp: true, 
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-600' 
    },
    { 
      label: 'Órdenes Activas', 
      value: '42', 
      trend: '+4 hoy', 
      trendUp: true, 
      icon: Factory, 
      color: 'from-indigo-500 to-blue-600' 
    },
    { 
      label: 'Eficiencia Planta', 
      value: '94.2%', 
      trend: '-0.8%', 
      trendUp: false, 
      icon: Activity, 
      color: 'from-amber-500 to-orange-600' 
    },
    { 
      label: 'Stock Crítico', 
      value: '12', 
      trend: '-2', 
      trendUp: true, 
      icon: Package, 
      color: 'from-rose-500 to-pink-600' 
    },
  ];

  const recentOrders = [
    { id: 'OP-2024-001', reference: 'Lote Camisas Oxford L', status: 'IN_PROGRESS', progress: 65, time: '2h' },
    { id: 'OP-2024-002', reference: 'Uniformes Colegio San José', status: 'PLANNED', progress: 0, time: '5h' },
    { id: 'OP-2024-003', reference: 'Pantalones Dril Beige', status: 'COMPLETED', progress: 100, time: '1d' },
  ];

  const activities = [
    { type: 'order', message: 'Nueva Orden de Servicio #OS-8830', time: 'Hace 10 min', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    { type: 'inventory', message: 'Bajo stock: Tela Oxford Azul (Corte 2)', time: 'Hace 45 min', icon: AlertTriangle, iconColor: 'text-amber-500' },
    { type: 'production', message: 'OP-2024-001 completó fase de corte', time: 'Hace 2 horas', icon: Clock, iconColor: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* ELITE WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{today}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Bienvenido, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">Administrador</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Aquí tienes un resumen de la operación textil hoy.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
              +5
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">Equipo en línea</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-[1.5rem] bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-indigo-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full border ${
                stat.trendUp 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* OPERATIONAL STATUS CHART (MOCK) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Rendimiento de Producción</h2>
              <p className="text-sm font-medium text-slate-500">Unidades producidas vs. meta semanal</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-600 dark:text-slate-300 outline-none">
              <option>Esta Semana</option>
              <option>Mes Anterior</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-4">
            {[45, 78, 62, 90, 55, 85, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-hidden relative group-hover:shadow-xl group-hover:shadow-indigo-500/20 transition-all duration-500"
                    style={{ height: '240px' }}
                  >
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-2xl transition-all duration-1000 delay-${i * 100} ease-out bg-gradient-to-t ${
                        i === 3 ? 'from-indigo-600 to-violet-500' : 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600'
                      }`}
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white">{h}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-slate-900/60 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8 text-center">Actividad</h2>
          <div className="space-y-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800" />
            
            {activities.map((act, i) => (
              <div key={i} className="relative flex items-start gap-6 group">
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:border-indigo-500/50 transition-all">
                  <act.icon className={`w-5 h-5 ${act.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight mb-1">{act.message}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
                </div>
              </div>
            ))}

            <button className="w-full py-4 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              Ver todo el historial
            </button>
          </div>
        </div>
      </div>

      {/* QUICK MODULE ACCESS & ACTIVE ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Active Production Orders Mini-Table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/60 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="p-10 pb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Órdenes de Producción</h2>
            <button 
              onClick={() => navigate('/production')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
              Gestionar todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referencia</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{order.reference}</p>
                      <p className="text-[10px] font-bold text-slate-400">{order.id}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                        order.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                        order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-600 border-slate-500/20'
                      }`}>
                        {order.status === 'IN_PROGRESS' ? 'Ejecución' : order.status === 'COMPLETED' ? 'Completada' : 'Planificada'}
                      </span>
                    </td>
                    <td className="px-6 py-6 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{order.progress}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all active:scale-95 border border-transparent hover:border-indigo-500/20">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-6">
          <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/30 group cursor-pointer active:scale-95 transition-all">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Plus className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-xl font-black mb-2 tracking-tight">Nueva Orden</h3>
             <p className="text-indigo-100 text-xs font-medium leading-relaxed">Inicia un nuevo proceso de servicio para cliente externo.</p>
          </div>

          <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] text-white border border-white/5 group cursor-pointer active:scale-95 transition-all shadow-xl">
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
                <Package className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-xl font-black mb-2 tracking-tight">Cargar Stock</h3>
             <p className="text-slate-400 text-xs font-medium leading-relaxed">Registra entrada de materias primas o insumos de costura.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
