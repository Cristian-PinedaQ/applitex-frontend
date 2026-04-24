import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Hash, PlusCircle, Loader2, Search, RefreshCw,
  ArrowUpRight, ChevronRight, User, FolderOpen, DollarSign,
  LayoutGrid, List
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { catalogService } from '../../services/catalog.service';
import { customerService } from '../../services/customer.service';
import { InventoryItem } from '../../types/inventory';
import { Category } from '../../types/catalog';
import { Customer } from '../../types/customer';
import { syncEngine } from '../../lib/syncCore';
import { INVENTORY_FIELD_POLICY, SyncScope } from '../../types/sync';

// ─── Helpers de stock ────────────────────────────────────────────────────────
const getStockBadge = (available: number) => {
  if (available > 20) return { label: 'Óptimo',   cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' };
  if (available > 5)  return { label: 'Bajo',      cls: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400 animate-pulse' };
  if (available > 0)  return { label: 'Crítico',   cls: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500 animate-pulse' };
  return              { label: 'Sin Stock',  cls: 'bg-rose-50 text-rose-700',      dot: 'bg-rose-500 animate-pulse' };
};

export default function InventoryPage() {
  const navigate = useNavigate();

  const [items,      setItems]      = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [viewMode,   setViewMode]   = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('inventory_view_mode') as 'grid' | 'table') || 'grid';
  });

  // ─── Filtros ──────────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('ALL');
  const [customerFilter,  setCustomerFilter]  = useState('ALL');

  // ─── Fetch con AbortController + SyncCore ───────────────────────────────
  const loadAll = async (signal?: AbortSignal, isRefresh = false) => {
    const scope: SyncScope = 'inventory:list';
    const version = syncEngine.generateVersion(scope);

    if (isRefresh) setSyncing(true);

    try {
      const [inv, cats, custs] = await Promise.all([
        inventoryService.getInventory(signal),
        catalogService.getCategories(signal),
        customerService.getAll(),
      ]);

      if (!syncEngine.isVersionValid(scope, version)) return;

      setItems(prev => syncEngine.mergeCollections(prev, inv, INVENTORY_FIELD_POLICY));
      setCategories(cats);
      setCustomers(custs);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') return;
      console.error('Error cargando inventario:', err);
      setError('No se pudo cargar el inventario. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    loadAll(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory_view_mode', viewMode);
  }, [viewMode]);

  // ─── Filtrado local ───────────────────────────────────────────────────────
  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || (item.reference ?? '').toLowerCase().includes(q);
    const matchCat    = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchCust   = customerFilter === 'ALL' || item.customerId === customerFilter;
    return matchSearch && matchCat && matchCust;
  });

  // ─── Métricas de resumen ────────────────────────────────────────────────
  const totalItems   = items.length;
  const totalValue   = items.reduce((acc, i) => acc + i.price * i.finalQuantity, 0);
  const totalReserved = items.reduce((acc, i) => acc + i.reservedQuantity, 0);
  const criticalItems = items.filter(i => i.availableQuantity <= 5).length;

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando inventario...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-rose-50 rounded-[40px] border border-rose-100">
      <p className="text-rose-600 font-bold mb-4">{error}</p>
      <button onClick={() => loadAll()} className="flex items-center gap-2 mx-auto px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl">
        <RefreshCw className="w-4 h-4" /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 pb-32">

      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Módulo Logístico</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Inventario</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg">
            Control de existencias multicliente, seguimiento por referencia y especificaciones técnicas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadAll(undefined, true)} disabled={syncing}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <button onClick={() => navigate('/inventory/new')}
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Ítem
          </button>
        </div>
      </div>

      {/* ─── Métricas Dashboard Elite ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Ítems', 
            value: totalItems, 
            sub: 'En catálogo',
            icon: Package,     
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
            border: 'border-indigo-100/50 dark:border-indigo-500/20'
          },
          { 
            label: 'Valor Inventario', 
            value: `$${(totalValue / 1000000).toFixed(1)}M`, 
            sub: 'COP Proyectado',
            icon: DollarSign, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
            border: 'border-emerald-100/50 dark:border-emerald-500/20'
          },
          { 
            label: 'Stock Reservado', 
            value: totalReserved, 
            sub: 'Comprometido',
            icon: RefreshCw,  
            color: 'text-amber-600',   
            bg: 'bg-amber-50/50 dark:bg-amber-900/10',
            border: 'border-amber-100/50 dark:border-amber-500/20'
          },
          { 
            label: 'Alertas Críticas', 
            value: criticalItems, 
            sub: 'Bajo mínimo',
            icon: Hash,        
            color: 'text-rose-600',   
            bg: 'bg-rose-50/50 dark:bg-rose-900/10',
            border: 'border-rose-100/50 dark:border-rose-500/20'
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={`group relative bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border ${border} transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
                  <span className="text-[10px] font-bold text-slate-400">{sub}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filtros y Selector de Vista ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-sm border border-slate-100 dark:border-slate-800 w-full lg:w-auto">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Búsqueda */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o referencia..."
                className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700 dark:text-white transition-all"
              />
            </div>
            {/* Filtro categoría */}
            <div className="relative min-w-[180px]">
              <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 dark:text-white appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Filtro cliente */}
            <div className="relative min-w-[180px]">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 dark:text-white appearance-none cursor-pointer transition-all"
              >
                <option value="ALL">Cliente</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-1 self-stretch shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* ─── Lista de ítems ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-20 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
              <Hash className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {search || categoryFilter !== 'ALL' || customerFilter !== 'ALL'
                ? 'Sin resultados con estos filtros'
                : 'Sin ítems de inventario'}
            </h3>
            <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">
              {search || categoryFilter !== 'ALL' || customerFilter !== 'ALL'
                ? 'Prueba con otros criterios de búsqueda.'
                : 'Crea tu primer ítem de inventario para comenzar.'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((item, idx) => {
              const badge = getStockBadge(item.availableQuantity);
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigate(`/inventory/${item.id}`)}
                  className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 cursor-pointer transition-all group active:scale-[0.98]"
                >
                  {/* Cabecera del card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${badge.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Nombre e info */}
                  <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{item.name}</h3>
                  {item.reference && (
                    <p className="text-xs font-bold text-slate-400 mb-3">Ref: {item.reference}</p>
                  )}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="w-3.5 h-3.5" /><span className="truncate">{item.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FolderOpen className="w-3.5 h-3.5" /><span className="truncate">{item.categoryName}</span>
                    </div>
                  </div>

                  {/* Pie del card: Triple Stock View */}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Físico</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{item.finalQuantity}</p>
                      </div>
                      <div className="text-center p-2 rounded-2xl bg-amber-50 dark:bg-amber-900/10">
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-tight">Resv.</p>
                        <p className="text-sm font-black text-amber-600">{item.reservedQuantity}</p>
                      </div>
                      <div className="text-center p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10">
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tight">Disp.</p>
                        <p className="text-sm font-black text-emerald-600">{item.availableQuantity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ver detalle */}
                  <div className="mt-4 flex items-center gap-2 text-indigo-600 text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" /> Ver ficha completa
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-800">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría / Cliente</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nivel Stock</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Físico</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Resv.</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Disponible</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const badge = getStockBadge(item.availableQuantity);
                    return (
                      <tr key={item.id} 
                        onClick={() => navigate(`/inventory/${item.id}`)}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.reference || 'Sin Ref.'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                              <FolderOpen size={12} className="text-slate-400" /> {item.categoryName}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400 italic">
                              <User size={10} className="text-slate-300" /> {item.customerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${badge.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                        </td>
                        <td colSpan={3} className="px-6 py-5 min-w-[240px]">
                          <div className="flex flex-col gap-2">
                            {/* Visual Stacked Bar */}
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.reservedQuantity / Math.max(item.finalQuantity, 1)) * 100}%` }}
                                className="h-full bg-amber-400" 
                                title={`Reservado: ${item.reservedQuantity}`}
                              />
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.availableQuantity / Math.max(item.finalQuantity, 1)) * 100}%` }}
                                className="h-full bg-emerald-500" 
                                title={`Disponible: ${item.availableQuantity}`}
                              />
                            </div>
                            {/* Detailed Metrics Labels */}
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                              <div className="flex gap-3">
                                <span className="text-slate-400">Físico: <span className="text-slate-700 dark:text-slate-200">{item.finalQuantity}</span></span>
                                <span className="text-amber-500">Resv: <span className="font-black">{item.reservedQuantity}</span></span>
                              </div>
                              <span className="text-emerald-600 font-black bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">Disp: {item.availableQuantity}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
