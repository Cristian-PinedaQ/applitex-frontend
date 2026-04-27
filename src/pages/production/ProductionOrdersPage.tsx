import { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Filter,
  Search,
  Factory,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_ORDERS = [
  {
    id: 'OP-2024-001',
    osReference: 'OS-8829',
    reference: 'Lote Camisas Oxford L',
    status: 'IN_PROGRESS',
    scheduledDate: '2024-04-24',
    progress: 65,
    items: 3
  },
  {
    id: 'OP-2024-002',
    osReference: 'OS-8830',
    reference: 'Producción Uniformes Colegio San José',
    status: 'PLANNED',
    scheduledDate: '2024-04-25',
    progress: 0,
    items: 12
  },
  {
    id: 'OP-2024-003',
    osReference: 'OS-8825',
    reference: 'Lote Pantalones Dril Beige',
    status: 'COMPLETED',
    scheduledDate: '2024-04-23',
    progress: 100,
    items: 5
  }
];

export function ProductionOrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* ELITE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-3xl border border-indigo-600/20 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <Factory className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Órdenes de Producción</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Gestión de ejecución y consumo de planta</p>
          </div>
        </div>

        <button className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          Nueva OP desde OS
        </button>
      </div>

      {/* OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Eficiencia de Planta', value: '94.2%', trend: '+2.1%', icon: Zap, color: 'text-emerald-500' },
          { label: 'Sobreconsumo (AVG)', value: '1.8%', trend: '-0.5%', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Salud SyncCore', value: 'Protegido', trend: 'LOCKED', icon: ShieldCheck, color: 'text-blue-500' },
          { label: 'Tiempo de Cierre', value: '45m', trend: '-5m', icon: Clock, color: 'text-indigo-500' }
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all group shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                m.trend.startsWith('+') || m.trend === 'LOCKED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
              }`}>
                {m.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{m.value}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por referencia o OS..."
            className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl py-5 px-14 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500/50 transition-all outline-none shadow-sm dark:shadow-none focus:ring-4 focus:ring-indigo-500/5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-8 py-5 rounded-2xl font-bold text-slate-900 dark:text-white hover:border-indigo-500/30 transition-all shadow-sm dark:shadow-none">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* ORDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ORDERS.map((op) => (
          <div key={op.id} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-indigo-500/40 transition-all group shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                op.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                op.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    op.status === 'IN_PROGRESS' ? 'bg-indigo-500' :
                    op.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`} />
                  {op.status === 'IN_PROGRESS' ? 'En Ejecución' : op.status === 'COMPLETED' ? 'Completada' : 'Planificada'}
                </div>
              </span>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{op.id}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{op.reference}</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">Vinculada a <span className="text-indigo-600 dark:text-indigo-400">#{op.osReference}</span></p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Progreso de ejecución</span>
                <span className="text-slate-900 dark:text-white">{op.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    op.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${op.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="text-slate-900 dark:text-slate-300">{op.items}</span> items en producción
              </span>
              <button 
                onClick={() => navigate(`/production/execution/${op.id}`)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-all uppercase tracking-widest group/btn"
              >
                Gestionar
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
