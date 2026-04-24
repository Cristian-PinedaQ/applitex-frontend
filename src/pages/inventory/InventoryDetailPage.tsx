import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Loader2, Save, Trash2, Package, ArrowUpCircle, ArrowDownCircle,
  Tag, Plus, X, Edit3, User, FolderOpen, DollarSign, History, AlertTriangle, RefreshCw, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../../services/inventory.service';
import { catalogService } from '../../services/catalog.service';
import { customerService } from '../../services/customer.service';
import { InventoryItem, InventoryItemRequest } from '../../types/inventory';
import { Category } from '../../types/catalog';
import { Customer } from '../../types/customer';
import { InventoryMovement, ActiveReservation } from '../../types/inventory';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useInventoryOperations } from './hooks/useInventoryOperations';
import { ConflictResolutionModal } from '../orders/components/ConflictResolutionModal';

const TX_TYPE_CONFIG: any = {
  IN:                { label: 'Entrada',  icon: ArrowUpCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50',  sign: '+' },
  OUT:               { label: 'Salida',   icon: ArrowDownCircle,  color: 'text-rose-600',    bg: 'bg-rose-50',     sign: '-' },
  ADJUST:            { label: 'Ajuste',   icon: RefreshCw,        color: 'text-indigo-600',  bg: 'bg-indigo-50',   sign: '±' },
  RESERVE:           { label: 'Reserva',  icon: Zap,             color: 'text-amber-600',   bg: 'bg-amber-50',    sign: '⧖' },
  COMMIT:            { label: 'Commit',   icon: Save,            color: 'text-indigo-600',  bg: 'bg-indigo-50',   sign: '✓' },
  RELEASE:           { label: 'Libera',   icon: X,               color: 'text-slate-600',   bg: 'bg-slate-50',    sign: '⟲' },
  REPAIR_ADJUSTMENT: { label: 'Reparar',  icon: AlertTriangle,   color: 'text-rose-700',    bg: 'bg-rose-100',    sign: '!' },
};

const InventoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(!isNew);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // ─── Track 1 & 2: SyncCore Operations ─────────────────────────────────────────
  const { 
    item, state, txState, updateMetadata, saveMetadata, adjustStock, resolveConflict,
    isDirty, isSaving 
  } = useInventoryOperations(null);

  // ─── UI State para Stock Adjust ──────────────────────────────────────────────
  const [txAmount, setTxAmount]       = useState('');
  const [txType, setTxType]           = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [txReason, setTxReason]       = useState('');

  const isKeyboardVisible = useKeyboardVisible();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const loadInitialData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [cats, custs] = await Promise.all([
        catalogService.getCategories(signal),
        customerService.getAll(),
      ]);
      setCategories(cats);
      setCustomers(custs);

      if (!isNew) {
        const data = await inventoryService.getInventoryById(id!, signal);
        resolveConflict(data); // Usamos resolveConflict para setear el item inicial sin activar DIRTY
      } else {
        // Inicializar para nuevo item
        resolveConflict({
          id: '', name: '', detail: '', categoryId: '', categoryName: '',
          customerId: '', customerName: '', reference: '', price: 0,
          initialQuantity: 0, finalQuantity: 0, attributes: [],
          version: 0
        } as any);
      }
    } catch (err: any) {
      console.error('Error loading inventory detail', err);
    } finally {
      setLoading(false);
    }
  }, [id, isNew, resolveConflict]);

  const loadMovements = useCallback(async (signal?: AbortSignal) => {
    if (isNew) return;
    setLoadingMovements(true);
    try {
      const data = await inventoryService.getMovements(id!, signal);
      setMovements(data);
    } catch (err) {
      console.error('Error loading movements', err);
    } finally {
      setLoadingMovements(false);
    }
  }, [id, isNew]);

  const loadReservations = useCallback(async (signal?: AbortSignal) => {
    if (isNew) return;
    setLoadingReservations(true);
    try {
      const data = await inventoryService.getReservations(id!, signal);
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations', err);
    } finally {
      setLoadingReservations(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    const ctrl = new AbortController();
    loadInitialData(ctrl.signal);
    loadMovements(ctrl.signal);
    loadReservations(ctrl.signal);
    return () => ctrl.abort();
  }, [loadInitialData, loadMovements, loadReservations]);

  const handleSaveMetadata = async () => {
    try {
      await saveMetadata();
    } catch (err: any) {
      if (err.response?.status === 409) setIsConflictOpen(true);
    }
  };

  const handleApplyStock = async () => {
    const amount = parseInt(txAmount, 10);
    if (!amount || !txReason) return;
    try {
      await adjustStock(txType === 'OUT' ? -amount : amount, txType, txReason);
      setTxAmount('');
      setTxReason('');
      loadMovements();
    } catch (err: any) {
      alert(err.message || 'Error al ajustar stock');
    }
  };

  const handleReload = async () => {
    const fresh = await inventoryService.getInventoryById(id!);
    resolveConflict(fresh);
    setIsConflictOpen(false);
  };

  const handleOverwrite = async () => {
    // Para inventario, el overwrite de metadata es aceptable, 
    // pero el stock se mantiene autoritativo.
    // Implementaremos un force save si es necesario, por ahora solo reload.
    handleReload();
  };

  if (loading || !item) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Preparando Laboratorio...</p>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-32 md:pb-12 px-4">
        {/* ─── Elite Header & Navigation ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/inventory')} 
              className="group p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all active:scale-90"
            >
              <ChevronLeft size={24} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>
            
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => navigate('/inventory')}>Inventario</span>
                <ChevronRight size={10} className="text-slate-300" />
                <span className="text-indigo-600">Detalle de Ítem</span>
              </nav>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {isNew ? 'Nuevo Ítem' : item.name}
                </h1>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${state === 'DIRTY' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <span className={`w-1 h-1 rounded-full ${state === 'DIRTY' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {state === 'DIRTY' ? 'Pendiente' : 'Sincronizado'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button
              onClick={handleSaveMetadata}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 ${
                isDirty ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {isSaving && state === 'SAVING' ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isNew ? 'Crear Ítem' : 'Actualizar Ficha'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Metadata */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <h3 className="text-xl font-black">Ficha Técnica</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre del Ítem</label>
                    <input type="text" value={item.name} onChange={e => updateMetadata({ name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-bold transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descripción</label>
                    <textarea rows={3} value={item.detail || ''} onChange={e => updateMetadata({ detail: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-medium transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría</label>
                    <select value={item.categoryId} onChange={e => updateMetadata({ categoryId: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                   <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Precio</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                      <input type="number" value={item.price} onChange={e => updateMetadata({ price: Number(e.target.value) })}
                        className="w-full pl-10 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Atributos (Metadatos) */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Tag size={24} /></div>
                    <h3 className="text-xl font-black">Especificaciones</h3>
                  </div>
                  <button onClick={() => updateMetadata({ attributes: [...item.attributes, { attributeKey: '', attributeValue: '' }] as any })}
                    className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                  >
                    <Plus size={20} />
                  </button>
               </div>
               <div className="space-y-3">
                  {item.attributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input type="text" value={attr.attributeKey} placeholder="Clave"
                        onChange={e => {
                          const newAttrs = [...item.attributes];
                          newAttrs[idx] = { ...newAttrs[idx], attributeKey: e.target.value };
                          updateMetadata({ attributes: newAttrs as any });
                        }}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs"
                      />
                      <input type="text" value={attr.attributeValue} placeholder="Valor"
                        onChange={e => {
                          const newAttrs = [...item.attributes];
                          newAttrs[idx] = { ...newAttrs[idx], attributeValue: e.target.value };
                          updateMetadata({ attributes: newAttrs as any });
                        }}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs"
                      />
                      <button onClick={() => {
                        const newAttrs = item.attributes.filter((_, i) => i !== idx);
                        updateMetadata({ attributes: newAttrs as any });
                      }} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar: Stock (Ledger Operations) */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 opacity-10"><Zap size={200} /></div>
               <div className="relative z-10">
                   <div className="space-y-6 mb-8">
                      <div className="flex flex-col gap-2">
                        {/* Visual Stacked Bar Sidebar */}
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.reservedQuantity / Math.max(item.finalQuantity, 1)) * 100}%` }}
                            className="h-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.availableQuantity / Math.max(item.finalQuantity, 1)) * 100}%` }}
                            className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/40 px-1">
                          <span>Comprometido vs Disponible</span>
                          <span>Capacidad: {item.finalQuantity}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 backdrop-blur-sm">
                          <p className="text-[8px] font-black uppercase text-white/40 mb-1">Físico</p>
                          <p className="text-2xl font-black tracking-tighter">{item.finalQuantity}</p>
                        </div>
                        <div className="bg-amber-500/10 p-4 rounded-2xl text-center border border-amber-500/20 backdrop-blur-sm">
                          <p className="text-[8px] font-black uppercase text-amber-400 mb-1">Resv.</p>
                          <p className="text-2xl font-black text-amber-400 tracking-tighter">{item.reservedQuantity}</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl text-center border border-emerald-500/20 backdrop-blur-sm">
                          <p className="text-[8px] font-black uppercase text-emerald-400 mb-1">Disp.</p>
                          <p className="text-2xl font-black text-emerald-400 tracking-tighter">{item.availableQuantity}</p>
                        </div>
                      </div>
                   </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                       <select value={txType} onChange={e => setTxType(e.target.value as any)}
                         className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                       >
                         <option value="IN" className="text-slate-900">Entrada</option>
                         <option value="OUT" className="text-slate-900">Salida</option>
                         <option value="ADJUST" className="text-slate-900">Ajuste</option>
                       </select>
                       <input type="number" placeholder="Cant." value={txAmount} onChange={e => setTxAmount(e.target.value)}
                         className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                    <input type="text" placeholder="Motivo del movimiento..." value={txReason} onChange={e => setTxReason(e.target.value)}
                       className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleApplyStock}
                      disabled={txState === 'PROCESSING' || !txAmount || !txReason}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {txState === 'PROCESSING' ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                      Registrar Movimiento
                    </button>
                    {txState === 'SUCCESS' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-center font-black text-emerald-400 uppercase tracking-widest">
                         ✓ Procesado correctamente
                      </motion.p>
                    )}
                  </div>
               </div>
            </div>

             {/* Auditoría del Ledger */}
             <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-slate-400" />
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Historial Ledger</h4>
                  </div>
                  <button onClick={loadMovements} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <RefreshCw size={14} className={`${loadingMovements ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {movements.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-slate-400 italic">Sin movimientos registrados.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {movements.map((m) => {
                        const config = TX_TYPE_CONFIG[m.type] || TX_TYPE_CONFIG.ADJUST;
                        const Icon = config.icon;
                        return (
                          <div key={m.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-2xl ${config.bg} ${config.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className={`text-sm font-black tracking-tight ${config.color}`}>
                                      {config.sign}{m.amount}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{config.label}</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-300 tabular-nums bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                    {new Date(m.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-3 my-2">
                                  "{m.reason}"
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Balance Post-Op:</span>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{m.finalQuantity}</span>
                                  </div>
                                  {m.referenceRequestId && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-[8px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100/50">
                                      <RefreshCw size={8} className="animate-spin-slow" />
                                      ID: {m.referenceRequestId.split('-')[0]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
             </div>

             {/* Reservas Activas (SyncCore Drill-down) */}
             <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-amber-500" />
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Reservas de Órdenes</h4>
                  </div>
                  <button onClick={loadReservations} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <RefreshCw size={14} className={`${loadingReservations ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="p-4 space-y-3">
                  {reservations.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400 italic">No hay reservas comprometidas.</p>
                  ) : (
                    reservations.map((r) => (
                      <div key={r.reservationId} 
                        onClick={() => navigate(`/orders/${r.orderId}`)}
                        className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">Orden #{r.orderNumber}</span>
                          <span className="text-sm font-black text-amber-600">{r.quantity} uds.</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-500">{r.customerName}</p>
                          <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Ver orden</span>
                            <ArrowUpCircle size={10} className="rotate-45" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <ConflictResolutionModal 
        isOpen={isConflictOpen}
        onClose={() => setIsConflictOpen(false)}
        onReload={handleReload}
        onOverwrite={handleOverwrite}
        isResolving={isSaving}
        resourceName="Este ítem de inventario"
        module="inventory"
      />
    </>
  );
};

export default InventoryDetailPage;
