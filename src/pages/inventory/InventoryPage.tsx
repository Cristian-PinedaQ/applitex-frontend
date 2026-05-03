import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Hash, PlusCircle, Loader2, Search, RefreshCw,
  ChevronRight, User, FolderOpen, DollarSign,
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

const getStockBadge = (available: number) => {
  if (available > 20) return { label: 'Óptimo',   cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' };
  if (available > 5)  return { label: 'Bajo',      cls: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400 animate-pulse' };
  if (available > 0)  return { label: 'Crítico',   cls: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500 animate-pulse' };
  return              { label: 'Sin Stock',  cls: 'bg-rose-50 text-rose-700',      dot: 'bg-rose-500 animate-pulse' };
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('inventory_view_mode') as 'grid' | 'table') || 'grid';
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');

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
      setError('No se pudo cargar el inventario.');
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

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return (item.name.toLowerCase().includes(q) || (item.reference ?? '').toLowerCase().includes(q))
      && (categoryFilter === 'ALL' || item.categoryId === categoryFilter)
      && (customerFilter === 'ALL' || item.customerId === customerFilter);
  });

  const totalItems = items.length;
  const totalValue = items.reduce((acc, i) => acc + i.price * i.finalQuantity, 0);
  const totalReserved = items.reduce((acc, i) => acc + i.reservedQuantity, 0);
  const criticalItems = items.filter(i => i.availableQuantity <= 5).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-[#7C5CFF] animate-spin" />
      <p className="text-slate-400 font-medium">Cargando inventario...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
      <p className="text-rose-600 font-medium mb-4">{error}</p>
      <button onClick={() => loadAll()} className="btn-danger">
        <RefreshCw className="w-4 h-4" /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-[#7C5CFF]/10 rounded-3xl border border-[#7C5CFF]/20 shadow-xl">
            <Package className="w-8 h-8 text-[#7C5CFF]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Gestión de Inventario</h1>
            <p className="text-slate-500 font-medium">Control de existencias multicliente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadAll(undefined, true)} disabled={syncing}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl text-slate-500 hover:text-[#7C5CFF] transition-all disabled:opacity-40 shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-[#7C5CFF]' : ''}`} />
          </button>
          <button onClick={() => navigate('/inventory/new')} className="btn-primary">
            <PlusCircle className="w-5 h-5" />
            Nuevo Ítem
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Ítems', value: String(totalItems), trend: 'TOTAL', icon: Package, color: '#7C5CFF' },
          { label: 'Valor', value: `$${(totalValue / 1000000).toFixed(1)}M`, trend: 'COP', icon: DollarSign, color: '#10b981' },
          { label: 'Reservado', value: String(totalReserved), trend: 'COMPROMETIDO', icon: RefreshCw, color: '#f59e0b' },
          { label: 'Críticos', value: String(criticalItems), trend: 'BAJO MÍN', icon: Hash, color: '#f43f5e' },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-[2rem] p-8 hover:border-[#7C5CFF]/30 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: m.color + '15' }}>
                <m.icon className="w-6 h-6" style={{ color: m.color }} />
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                {m.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{m.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o referencia..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl py-5 px-14 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#7C5CFF] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl text-slate-900 dark:text-white font-medium cursor-pointer"
          >
            <option value="ALL">Categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
            className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl text-slate-900 dark:text-white font-medium cursor-pointer"
          >
            <option value="ALL">Cliente</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl ${viewMode === 'grid' ? 'bg-[#7C5CFF] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
          <LayoutGrid size={20} />
        </button>
        <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl ${viewMode === 'table' ? 'bg-[#7C5CFF] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
          <List size={20} />
        </button>
      </div>

      {/* Items List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No se encontraron ítems</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, idx) => {
              const badge = getStockBadge(item.availableQuantity);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigate(`/inventory/${item.id}`)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-[#7C5CFF] cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-[#7C5CFF]/10 rounded-2xl">
                      <Package className="w-5 h-5 text-[#7C5CFF]" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold ${badge.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1 truncate">{item.name}</h3>
                  {item.reference && <p className="text-xs text-slate-400 mb-3">Ref: {item.reference}</p>}
                  <div className="space-y-1.5 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /><span className="truncate">{item.customerName}</span></div>
                    <div className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /><span className="truncate">{item.categoryName}</span></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-xl bg-slate-50">
                        <p className="text-[8px] text-slate-400 uppercase">Físico</p>
                        <p className="text-sm font-semibold text-slate-900">{item.finalQuantity}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-amber-50">
                        <p className="text-[8px] text-amber-500 uppercase">Resv.</p>
                        <p className="text-sm font-semibold text-amber-600">{item.reservedQuantity}</p>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-emerald-50">
                        <p className="text-[8px] text-emerald-500 uppercase">Disp.</p>
                        <p className="text-sm font-semibold text-emerald-600">{item.availableQuantity}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ítem</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(item => (
                    <tr key={item.id} onClick={() => navigate(`/inventory/${item.id}`)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#7C5CFF]/10 rounded-xl">
                            <Package className="w-4 h-4 text-[#7C5CFF]" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.categoryName}</td>
                      <td className="px-6 py-4 text-slate-600">{item.customerName}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">{item.finalQuantity}</span>
                          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded">{item.reservedQuantity}</span>
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{item.availableQuantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}