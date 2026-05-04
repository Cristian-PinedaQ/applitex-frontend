import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,  
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  FileText,
  Activity,
  History,
  Signature,
  Settings2,
  Lock,
  AlertCircle,
  Loader2,
  FileEdit,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductionService } from '../../services/production.service';
import { toast } from 'react-hot-toast';
import { DynamicFormRenderer } from '../../components/common/DynamicFormRenderer';

// ─── Main Page ───────────────────────────────────────────────────────────────

export function ProductionExecutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'execution' | 'reports' | 'ledger'>('execution');
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(crypto.randomUUID());

  // ── Report state por item ──
  const [itemsData, setItemsData] = useState<Record<string, Record<string, any>>>({});
  const [consumedByItem, setConsumedByItem] = useState<Record<string, number | ''>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});
  const saveTimersRef = useRef<Record<string, number>>({});
  const [signedBy, setSignedBy] = useState<string>('');
  const [reportSubmitting, setReportSubmitting] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showServiceOrderDetail, setShowServiceOrderDetail] = useState(false);
  const [serviceOrderData, setServiceOrderData] = useState<any>(null);
  const [isLoadingServiceOrder, setIsLoadingServiceOrder] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  useEffect(() => {
    if (order?.items) {
      const initial: Record<string, Record<string, any>> = {};
      order.items.forEach((item: any) => {
        initial[item.id] = item.filledData || {};
      });
      setItemsData(initial);
    }
  }, [order]);

  useEffect(() => {
    if (order?.id && !serviceOrderData) {
      setIsLoadingServiceOrder(true);
      ProductionService.getServiceOrderInfo(order.id)
        .then(setServiceOrderData)
        .catch(err => {
          console.error('Error loading service order:', err);
        })
        .finally(() => setIsLoadingServiceOrder(false));
    }
  }, [order?.id]);

  useEffect(() => {
    if (showServiceOrderDetail && order?.id) {
      setIsLoadingServiceOrder(true);
      ProductionService.getServiceOrderInfo(order.id)
        .then(setServiceOrderData)
        .catch(err => {
          console.error('Error loading service order:', err);
          toast.error('Error al cargar detalle de orden de servicio');
        })
        .finally(() => setIsLoadingServiceOrder(false));
    }
  }, [showServiceOrderDetail, order?.id]);

  // Cleanup de timers de autosave al desmontar componente
  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [orderData, ledgerData] = await Promise.all([
        ProductionService.getOrderById(id!),
        ProductionService.getLedger(id!, 0, 10),
      ]);
      setOrder(orderData);
      setLedger(ledgerData.content || []);
    } catch (error) {
      console.error('Error loading production data:', error);
      setError('Error al sincronizar con el servidor');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const updateConsumed = async (itemId: string, amount: number) => {
    if (amount <= 0) return;
    const previousOrder = { ...order };
    const updatedItems = order.items.map((item: any) =>
      item.id === itemId
        ? { ...item, consumedQuantity: (item.consumedQuantity || 0) + amount }
        : item
    );
    setOrder({ ...order, items: updatedItems });
    setIsSyncing(true);
    try {
      await ProductionService.consumeItem(itemId, {
        amount,
        reason: 'Consumo operativo en planta',
        idempotencyKey: crypto.randomUUID(),
        correlationId: `ui-${id}-${Date.now()}`,
      });
      await loadData(true);
    } catch (err: any) {
      setOrder(previousOrder);
      setError(err.response?.data?.message || 'Error en el consumo. Reintentando...');
      setTimeout(() => loadData(), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConsumptionSubmit = (itemId: string) => {
    if (order?.status === 'COMPLETED') return;
    
    const amount = consumedByItem[itemId];
    if (amount === undefined || amount === '' || amount <= 0) return;
    
    updateConsumed(itemId, amount);
    setConsumedByItem(prev => ({ ...prev, [itemId]: '' }));
  };

  // ── Handlers ──
  const handleItemChange = (itemId: string, data: Record<string, any>) => {
    // Actualizar estado UI inmediatamente
    setItemsData((prev: Record<string, Record<string, any>>) => ({
      ...prev,
      [itemId]: data
    }));

    // Capturar snapshot de estado para evitar stale state
    const currentOrderId = order?.id;
    const isCompleted = order?.status === 'COMPLETED';
    
    // Si no hay orderId o está completada, no guardar
    if (!currentOrderId || isCompleted) return;

    // Cancelar timer anterior para este item
    if (saveTimersRef.current[itemId]) {
      clearTimeout(saveTimersRef.current[itemId]);
    }

    // Debounce de 700ms antes de guardar (usa snapshot - sin acceso a 'order' dentro)
    saveTimersRef.current[itemId] = setTimeout(async () => {
      try {
        setSaveStatus(prev => ({ ...prev, [itemId]: 'saving' }));
        await ProductionService.saveItemReport(currentOrderId, itemId, data);
        setSaveStatus(prev => ({ ...prev, [itemId]: 'saved' }));
        
        // Resetear a idle después de 1.5s
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [itemId]: 'idle' }));
        }, 1500);
      } catch (err) {
        console.error('Error saving report:', err);
        setSaveStatus(prev => ({ ...prev, [itemId]: 'error' }));
      }
    }, 700);
  };

  // ── Report submit ──
  const handleReportSubmit = async () => {
    if (!order) return;

    // Validar campos requeridos por cada item (maneja 0 y false como válidos)
    for (const item of order.items) {
      const template = item.templateSnapshot;
      
      // 🧨 Opcional: bloquear items sin plantilla (descomenta si es necesario)
      // if (!template?.fields) {
      //   throw new Error(`Ítem "${item.productSnapshot?.name}" no tiene plantilla`);
      // }
      
      if (!template?.fields) continue;
      
      const data = itemsData[item.id] || item.filledData || {};
      
      for (const field of template.fields) {
        if (field.required) {
          const value = data[field.name];
          if (value === undefined || value === null || value === '') {
            setReportError(`Campo requerido en "${item.productSnapshot?.name}": ${field.name}`);
            return;
          }
        }
      }
    }

    if (!signedBy.trim()) {
      setReportError('El nombre del responsable es obligatorio para firmar.');
      return;
    }

    setReportSubmitting(true);
    setReportError(null);

    try {
      // 📦 Payload correcto - usa values (contrato único con backend)
      const itemsPayload = order.items.map((item: any) => ({
        id: item.id,
        values: itemsData[item.id] || {}
      }));

      await ProductionService.completeProduction(order.id, {
        items: itemsPayload,
        signedBy: signedBy.trim(),
        idempotencyKey: crypto.randomUUID(),
        correlationId: `complete-${order.id}-${Date.now()}`,
      });
      setReportSuccess(true);
      setTimeout(() => navigate('/production'), 1500);
    } catch (err: any) {
      setReportError(err.response?.data?.message || 'Error al enviar el reporte.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setActiveTab('reports');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Planta...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const hasAnyTemplate = order?.items?.some?.((item: any) => item.templateSnapshot?.fields?.length > 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/production')}
            className="p-2.5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{order.reference}</h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Ref: <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{order.id.substring(0, 8)}</span> • Vinculada a{' '}
              <button 
                onClick={() => setShowServiceOrderDetail(true)}
                className="text-indigo-600 dark:text-indigo-500 font-bold hover:underline inline-flex items-center gap-1"
              >
                #{order.serviceOrder.orderNumber}
                <ExternalLink className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl font-bold transition-all border border-slate-200 dark:border-white/10 active:scale-95 shadow-sm dark:shadow-none">
            <RotateCcw className="w-5 h-5" />
            Resetear
          </button>
          <button
            onClick={handleComplete}
            disabled={isSyncing || order.status === 'COMPLETED'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
              order.status === 'COMPLETED'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isSyncing ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : order.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {order.status === 'COMPLETED' ? 'Orden Completada' : 'Finalizar OP'}
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/30 animate-in slide-in-from-top-4 duration-300 fixed top-8 right-8 z-[100]">
          <Activity className="w-4 h-4 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Synchronizing state...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            Cerrar
          </button>
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 flex-nowrap">
          {[
            { id: 'execution', label: 'Ejecución y Consumo', icon: Activity },
            { id: 'reports',   label: 'Reportes de Calidad', icon: FileText },
            { id: 'ledger',    label: 'Auditoría (Ledger)',  icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'reports' && hasAnyTemplate && (
                <span className="ml-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  !
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXECUTION TAB ── */}
      {activeTab === 'execution' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            {order.items.map((item: any) => {
              const serviceDetail = serviceOrderData?.details?.find(
                (d: any) => d.id === item.serviceOrderDetailId
              );
              const hasInventoryLink = !!item.inventoryItemId;
              const reserved = serviceDetail?.usedInventoryQuantity ?? 
                               item.usedInventoryQuantity ?? 
                               item.orderedQuantity ?? 
                               0;
              const consumed = item.consumedQuantity ?? 0;
              const variance = reserved - consumed;
              const snapshot = item.productSnapshot || {};
              const hasInventoryData = reserved > 0 || hasInventoryLink;
              return (
                <div key={item.id} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-indigo-500/20 rounded-2xl md:rounded-3xl p-4 md:p-8 transition-all shadow-lg md:shadow-xl shadow-slate-200/40 dark:shadow-none group overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 truncate">{snapshot.name || 'Sin nombre'}</h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 font-mono font-bold tracking-tight uppercase tracking-widest truncate">{snapshot.sku || 'N/A'}</p>
                      
                      <div className="mt-3 md:mt-6 mb-2 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
                          <span className="text-[8px] md:text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest">Servicio:</span>
                          <span className="text-xs md:text-sm font-black text-indigo-900 dark:text-indigo-300">{item.quantity ?? 0}</span>
                          <span className="text-[8px] md:text-[10px] text-indigo-400 uppercase">{snapshot.unit}</span>
                        </div>
                        {hasInventoryLink && (
                          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            <span className="text-[8px] md:text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-widest">Inventario:</span>
                            <span className="text-xs md:text-sm font-black text-amber-800 dark:text-amber-300 truncate max-w-[100px] md:max-w-none">{serviceDetail?.inventoryItemName || item.inventoryItemName || '—'}</span>
                          </div>
                        )}
                      </div>

                      {hasInventoryData && (
                        <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2 md:gap-4">
                          <div className="p-2 md:p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                            <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Reservado</p>
                            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{reserved}<span className="text-[10px] md:text-xs text-slate-400 ml-1 font-normal uppercase">{snapshot.unit}</span></p>
                          </div>
                          <div className="p-2 md:p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                            <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Consumido</p>
                            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-200">{consumed}<span className="text-[10px] md:text-xs text-slate-400 ml-1 font-normal uppercase">{snapshot.unit}</span></p>
                          </div>
                          <div className={`p-2 md:p-4 rounded-xl md:rounded-2xl text-center border ${
                            variance > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' :
                            variance < 0 ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' :
                            'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                          }`}>
                            <p className={`text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1 ${
                              variance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                              variance < 0 ? 'text-rose-600 dark:text-rose-400' :
                              'text-indigo-600 dark:text-indigo-400'
                            }`}>Diferencia</p>
                            <p className={`text-lg md:text-xl font-black ${
                              variance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                              variance < 0 ? 'text-rose-600 dark:text-rose-400' :
                              'text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {variance > 0 ? '+' : ''}{variance.toFixed(1)}<span className="text-[10px] md:text-xs ml-1 font-normal uppercase">{snapshot.unit}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-72 space-y-3 md:space-y-4 mt-4 md:mt-0">
                      {hasInventoryData ? (
                        <>
                          <div className="relative">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.2em] mb-2 md:mb-3 px-1">Registrar Consumo</label>
                            <div className="flex items-center gap-2 p-2 md:p-3 bg-slate-50 dark:bg-slate-950 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner">
                              <input
                                type="number"
                                value={consumedByItem[item.id] ?? ''}
                                disabled={order.status === 'COMPLETED'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setConsumedByItem(prev => ({
                                    ...prev,
                                    [item.id]: val === '' ? '' : Number(val)
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleConsumptionSubmit(item.id);
                                  }
                                }}
                                placeholder="0"
                                className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white w-full text-right px-1 md:px-2"
                              />
                              <span className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase">{snapshot.unit}</span>
                              <button
                                type="button"
                                onClick={() => handleConsumptionSubmit(item.id)}
                                disabled={order.status === 'COMPLETED' || !consumedByItem[item.id] || Number(consumedByItem[item.id]) <= 0}
                                className="px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all active:scale-95"
                              >
                                Enviar
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-right font-bold uppercase tracking-widest">
                              {order.status === 'COMPLETED' 
                                ? 'Orden cerrada' 
                                : 'Enter o Enviar'}
                            </p>
                          </div>
<div className={`flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-xl border ${
                            variance > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                            variance < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                                          'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          }`}>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            {variance > 0 ? <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4" /> : variance < 0 ? <AlertTriangle className="w-3 md:w-4 h-3 md:h-4" /> : <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4" />}
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em]">
                              {variance > 0 ? 'Sobrante' : variance < 0 ? 'Excedido' : 'Exacto'}
                            </span>
                          </div>
                          <span className="font-mono font-black text-xs md:text-sm">{variance > 0 ? '+' : ''}{variance.toFixed(1)}</span>
                        </div>
                        </>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">Sin inventario asociado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <h4 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Resumen de Consumo
              </h4>
              <div className="space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total ítems</span>
                  <span className="text-slate-900 dark:text-white font-black">{order.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Eficiencia Global</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">98.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Variación Neta</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">+5.2 Mts</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/10 dark:bg-indigo-600/10 border border-indigo-600/20 dark:border-indigo-500/30 rounded-[2rem] p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/40">
                  <Signature className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-black text-indigo-900 dark:text-white uppercase tracking-widest">Firma Digital</h4>
              </div>
              <p className="text-xs text-indigo-900/60 dark:text-slate-300 font-medium leading-relaxed mb-8">
                Al finalizar la orden, se generará un reporte inmutable con snapshot de inventario y firma digital del operario.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-indigo-200 dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-[0.2em] mb-2 px-1">Idempotency Token</p>
                  <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate font-bold">{idempotencyKey}</p>
                </div>
                <button
                  onClick={() => navigate('/production/templates/new')}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                  Configurar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-400">

          {/* Forms por item */}
          <div className="xl:col-span-2 space-y-6">
            {order.items.map((item: any) => {
              const template = item.templateSnapshot;
              const hasTemplate = template && Array.isArray(template.fields) && template.fields.length > 0;
              const filledData = itemsData[item.id] || item.filledData || {};
              const completedFields = hasTemplate
                ? template.fields.filter((f: any) => filledData[f.name] !== undefined && filledData[f.name] !== '').length
                : 0;
              const totalFields = hasTemplate ? template.fields.length : 0;
              const progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

              return (
                <div key={item.id} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-lg md:shadow-xl shadow-slate-200/40 dark:shadow-none">
                  {/* Card header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-xl border border-indigo-600/20 dark:border-indigo-500/20">
                        <FileEdit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white">
                          {item.productSnapshot?.name || 'Producto'}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                          {hasTemplate ? `${progress}% completado` : 'Sin plantilla'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasTemplate && saveStatus[item.id] === 'saving' && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">
                          Guardando...
                        </span>
                      )}
                      {hasTemplate && saveStatus[item.id] === 'saved' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Guardado
                        </span>
                      )}
                      {hasTemplate && saveStatus[item.id] === 'error' && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                      {order?.status === 'COMPLETED' && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-lg">
                          Solo lectura
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Form content */}
                  <div className="p-4 md:p-6">
                    {!hasTemplate ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <Settings2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Este ítem no tiene plantilla configurada
                        </p>
                      </div>
                    ) : (
                      <DynamicFormRenderer
                        templateSnapshot={template}
                        filledData={filledData}
                        onChange={(data) => handleItemChange(item.id, data)}
                        disabled={reportSubmitting || reportSuccess || order?.status === 'COMPLETED'}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Error */}
            {reportError && (
              <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{reportError}</p>
              </div>
            )}

            {/* Success */}
            {reportSuccess && (
              <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">¡Reporte enviado y OP finalizada! Redirigiendo...</p>
              </div>
            )}
          </div>

          {/* Sidebar: Firma */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                  <Signature className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Firma y Cierre</h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Al firmar, el reporte queda sellado de forma inmutable en el ledger de producción.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Responsable <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del operario..."
                    value={signedBy}
                    onChange={(e) => { setSignedBy(e.target.value); setReportError(null); }}
                    disabled={reportSubmitting || reportSuccess}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Token */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1.5">Idempotency Token</p>
                  <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate font-bold">{idempotencyKey}</p>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  {[
                    { label: 'Formularios llenados', done: order.items.every((i: any) => {
                      const t = i.templateSnapshot;
                      if (!t?.fields?.length) return true;
                      const d = itemsData[i.id] || i.filledData || {};
                      return t.fields.every((f: any) => d[f.name] !== undefined && d[f.name] !== '');
                    })},
                    { label: 'Responsable asignado', done: !!signedBy.trim() },
                  ].map((check) => (
                    <div key={check.label} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${
                      check.done
                        ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-950/40 text-slate-400'
                    }`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${check.done ? '' : 'opacity-30'}`} />
                      {check.label}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleReportSubmit}
                  disabled={reportSubmitting || reportSuccess}
                  className="btn-primary"
                >
                  {reportSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : reportSuccess ? (
                    <><CheckCircle2 className="w-4 h-4" /> ¡Enviado!</>
                  ) : (
                    <><Signature className="w-4 h-4" /> Firmar y Finalizar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEDGER TAB ── */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none animate-in fade-in duration-500">
          <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Production Ledger</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">Registro inmutable de eventos operativos (Append-only)</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">En Línea</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50">
                  {['Evento', 'Fecha y Hora', 'Responsable', 'Detalles'].map((h, i) => (
                    <th key={h} className={`px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10 ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {ledger.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 ${
                        log.eventType === 'CREATED'  ? 'text-slate-600' :
                        log.eventType === 'CONSUMED' ? 'text-indigo-600' : 'text-emerald-600'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-slate-500 dark:text-slate-300 font-bold">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-slate-900 dark:text-slate-100">
                      {log.payload?.signedBy || 'Sistema'}
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 dark:text-slate-400 text-right italic font-medium">
                      {log.payload?.message || `Evento de producción: ${log.eventType}`}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Sin eventos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Detalle Orden de Servicio ── */}
      {showServiceOrderDetail && order?.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowServiceOrderDetail(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10">
            {isLoadingServiceOrder ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : serviceOrderData ? (
              <>
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 z-10">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Orden de Servicio</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      #{serviceOrderData.orderInfo?.orderNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-black uppercase rounded-lg ${
                      serviceOrderData.orderInfo?.status === 'COMPLETED' 
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : serviceOrderData.orderInfo?.status === 'CANCELLED'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {serviceOrderData.orderInfo?.status || '—'}
                    </span>
                    <button
                      onClick={() => setShowServiceOrderDetail(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 📌 Sección 1: Información General */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Información General</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Fecha Creación</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.audit?.createdAt 
                            ? new Date(serviceOrderData.audit.createdAt).toLocaleString() 
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Fecha Completada</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.orderInfo?.completedAt 
                            ? new Date(serviceOrderData.orderInfo.completedAt).toLocaleString() 
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 👤 Sección 2: Cliente */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Datos del Cliente</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Nombre</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.customer?.fullName || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Documento</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.customer?.documentType && (
                            <span className="text-slate-500 mr-1">{serviceOrderData.customer.documentType}</span>
                          )}
                          {serviceOrderData.customer?.document || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.customer?.phone || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.customer?.email || '—'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Dirección</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.customer?.address || '—'}
                          {serviceOrderData.customer?.city && `, ${serviceOrderData.customer.city}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 📦 Sección 3: Detalles */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Detalles ({serviceOrderData.details?.length || 0})</h3>
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-black text-slate-500">Categoría</th>
                            <th className="px-3 py-2 text-left text-xs font-black text-slate-500">Producto</th>
                            <th className="px-3 py-2 text-right text-xs font-black text-slate-500">Cant.</th>
                            <th className="px-3 py-2 text-right text-xs font-black text-slate-500">Precio</th>
                            <th className="px-3 py-2 text-right text-xs font-black text-slate-500">Total</th>
                            <th className="px-3 py-2 text-left text-xs font-black text-slate-500">Inventario</th>
                            <th className="px-3 py-2 text-right text-xs font-black text-slate-500">Usado</th>
                            <th className="px-3 py-2 text-left text-xs font-black text-slate-500">Reserva ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(serviceOrderData.details || []).map((detail: any, idx: number) => (
                            <tr key={detail.id || idx} className="border-t border-slate-200 dark:border-white/5">
                              <td className="px-3 py-2 text-slate-900 dark:text-white">{detail.categoryName || '—'}</td>
                              <td className="px-3 py-2 text-slate-900 dark:text-white">{detail.productName || '—'}</td>
                              <td className="px-3 py-2 text-right text-slate-900 dark:text-white">{detail.quantity ?? '—'}</td>
                              <td className="px-3 py-2 text-right text-slate-900 dark:text-white">
                                {detail.price ? `$${Number(detail.price).toLocaleString()}` : '—'}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                                {detail.totalValue ? `$${Number(detail.totalValue).toLocaleString()}` : '—'}
                              </td>
                              <td className="px-3 py-2 text-slate-900 dark:text-white">
                                {detail.inventoryItemName || '—'}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-900 dark:text-white">
                                {detail.usedInventoryQuantity != null 
                                  ? Number(detail.usedInventoryQuantity).toLocaleString() 
                                  : '0'}
                              </td>
                              <td className="px-3 py-2 text-slate-500 font-mono text-xs">
                                {detail.reservationRequestId || '—'}
                              </td>
                            </tr>
                          ))}
                          {(serviceOrderData.details || []).length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-3 py-4 text-center text-slate-500">Sin detalles</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🕓 Sección 4: Auditoría */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Auditoría</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Creado por</p>
                        <p className="font-bold text-slate-900 dark:text-white">{serviceOrderData.audit?.createdBy || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Última actualización</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {serviceOrderData.audit?.updatedAt 
                            ? new Date(serviceOrderData.audit.updatedAt).toLocaleString()
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 flex justify-end p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
                  <button
                    onClick={() => setShowServiceOrderDetail(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-500">No se pudieron cargar los datos</p>
                <button
                  onClick={() => setShowServiceOrderDetail(false)}
                  className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}