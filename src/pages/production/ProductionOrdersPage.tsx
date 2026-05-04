import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Filter,
  Search,
  Factory,
  ShieldCheck,
  Zap,
  RefreshCw,
  Trash2,
  Ban
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CreateProductionOrderModal } from './CreateProductionOrderModal';
import { ProductionService } from '../../services/production.service';
import { useAuthStore } from '../../store/authStore';

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: 'En Ejecución',
  COMPLETED:   'Completada',
  PLANNED:     'Planificada',
  CANCELLED:   'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  COMPLETED:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  PLANNED:     'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  CANCELLED:   'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const DOT_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-indigo-500',
  COMPLETED:   'bg-emerald-500',
  PLANNED:     'bg-slate-500',
  CANCELLED:   'bg-rose-500',
};

export function ProductionOrdersPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const isAdmin = role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN';

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await ProductionService.getOrders(0, 50);
      // getOrders devuelve Page<> con .content, o un array directo
      setOrders(data.content ?? data ?? []);
    } catch {
      setLoadError('No se pudieron cargar las órdenes de producción.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter((op) => {
    const term = searchTerm.toLowerCase();
    return (
      op.reference?.toLowerCase().includes(term) ||
      op.serviceOrder?.orderNumber?.toLowerCase().includes(term)
    );
  });

  // Métricas derivadas de datos reales
  const total      = orders.length;
  const inProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const completed  = orders.filter((o) => o.status === 'COMPLETED').length;
  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleDelete = async (orderId: string) => {
    if (!isAdmin) {
      toast.error('Solo administradores pueden eliminar órdenes');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta orden de producción? Esta acción es irreversible y eliminará la orden físicamente.');
    if (!confirmed) return;

    setDeletingId(orderId);
    try {
      await ProductionService.deleteOrder(orderId);
      toast.success('Orden de producción eliminada');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la orden');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!isAdmin) {
      toast.error('Solo administradores pueden cancelar órdenes');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas cancelar esta orden de producción? Se liberará el inventario asociado.');
    if (!confirmed) return;

    setCancellingId(orderId);
    try {
      await ProductionService.cancelOrder(orderId);
      toast.success('Orden de producción cancelada');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar la orden');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* MODAL */}
      <CreateProductionOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newOrder) => {
          loadOrders(); // refresca la lista
          navigate(`/production/execution/${newOrder.id}`);
        }}
      />

      {/* HEADER */}
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

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all disabled:opacity-40 shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            Nueva OP desde OS
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total OPs',      value: String(total),      trend: 'TOTAL',    icon: Factory,     color: 'text-indigo-500'  },
          { label: 'En Ejecución',   value: String(inProgress), trend: 'ACTIVAS',  icon: Zap,         color: 'text-emerald-500' },
          { label: 'Completadas',    value: String(completed),  trend: 'CERRADAS', icon: ShieldCheck, color: 'text-blue-500'    },
          { label: 'Tasa de Cierre', value: `${efficiency}%`,   trend: `${efficiency}%`, icon: Clock, color: 'text-amber-500'  },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all group shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
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

      {/* LOADING */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando órdenes...</p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {!isLoading && loadError && (
        <div className="flex items-center justify-between p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{loadError}</span>
          </div>
          <button onClick={loadOrders} className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 hover:opacity-80 uppercase tracking-widest">
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !loadError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10">
            <Factory className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">
            {searchTerm ? 'Sin resultados para la búsqueda' : 'No hay órdenes de producción aún'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Crear primera OP
            </button>
          )}
        </div>
      )}

      {/* ORDERS GRID */}
      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((op) => {
            const statusKey  = op.status ?? 'PLANNED';
            const itemCount  = op.items?.length ?? 0;
            const doneItems  = op.items?.filter((i: any) => (i.consumedQuantity ?? 0) >= i.orderedQuantity).length ?? 0;
            const progress   = itemCount > 0
              ? Math.round((doneItems / itemCount) * 100)
              : (statusKey === 'COMPLETED' ? 100 : 0);

            const canDelete = isAdmin && statusKey === 'PLANNED';
            const canCancel = isAdmin && statusKey !== 'COMPLETED' && statusKey !== 'CANCELLED';
            const isCancelled = statusKey === 'CANCELLED';

            return (
              <div key={op.id} className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 hover:border-indigo-500/40 transition-all group shadow-sm dark:shadow-none ${isCancelled ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-4 md:mb-8">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_COLOR[statusKey] ?? STATUS_COLOR.PLANNED}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${DOT_COLOR[statusKey] ?? DOT_COLOR.PLANNED}`} />
                      {STATUS_LABEL[statusKey] ?? statusKey}
                    </div>
                  </span>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-mono">
                    {op.id?.substring(0, 8)}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1 md:mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {op.reference ?? 'Sin referencia'}
                </h3>
                <p className="text-xs md:text-sm font-bold text-slate-500 mb-4 md:mb-8">
                  Vinculada a <span className="text-indigo-600 dark:text-indigo-400">#{op.serviceOrder?.orderNumber ?? '—'}</span>
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>Progreso de ejecución</span>
                    <span className="text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div
                      className={`h-full transition-all duration-1000 ${statusKey === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

<div className="mt-6 md:mt-10 flex flex-col gap-4 border-t border-slate-100 dark:border-white/5 pt-4 md:pt-6">
                    
                  {/* Fila 1: items + botón principal */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <span className="text-slate-900 dark:text-slate-300">{itemCount}</span> items
                    </span>
                    <div className="flex-shrink-0">
                      {!isCancelled ? (
                        <button
                          onClick={() => navigate(`/production/execution/${op.id}`)}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-500 active:scale-95 transition-all"
                        >
                          <span>Gestionar</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          Cancelada
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Fila 2: acciones secundarias (debajo de items) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(op.id)}
                        disabled={deletingId === op.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
                        title="Eliminar orden"
                      >
                        {deletingId === op.id ? (
                          <span className="animate-pulse">Eliminando...</span>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </>
                        )}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(op.id)}
                        disabled={cancellingId === op.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-50"
                        title="Cancelar orden"
                      >
                        {cancellingId === op.id ? (
                          <span className="animate-pulse">Cancelando...</span>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancelar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}