import { useState, useEffect } from 'react';
import {
  X,
  Factory,
  Link2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

import { ordersService } from '../../services/orders.service';
import { ProductionService } from '../../services/production.service';
import { ServiceOrder } from '../../types/orders';

interface CreateProductionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: any) => void;
}

export function CreateProductionOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductionOrderModalProps) {
  const [serviceOrderId, setServiceOrderId] = useState('');
  const [reference, setReference] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchServiceOrders();
  }, [isOpen]);

  const fetchServiceOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);

    try {
      const all = await ordersService.getAll();

      // SOLO órdenes listas para producción
      const eligible = all.filter(
        (os) => os.status === 'CREATED'
      );

      setServiceOrders(eligible);
    } catch {
      setOrdersError('No se pudieron cargar las órdenes de servicio.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const selectedOS = serviceOrders.find(
    (os) => os.id === serviceOrderId
  ) ?? null;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!serviceOrderId.trim()) {
      setError('Debes seleccionar una Orden de Servicio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newOrder = await ProductionService.createOrder({
        serviceOrderId: serviceOrderId.trim(),
        reference: reference.trim() || undefined,
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setServiceOrderId('');
        setReference('');
        onClose();
        onSuccess?.(newOrder);
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setError(null);
    setSuccess(false);
    setServiceOrderId('');
    setReference('');
    setOrdersError(null);

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
              <Factory className="w-6 h-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Nueva Orden de Producción
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Desde Orden de Servicio
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-8 my-6 border-t border-slate-100 dark:border-white/5" />

        {/* BODY */}
        <div className="px-8 pb-8 space-y-5">

          {/* SELECT OS */}
          <div className="space-y-2">

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Link2 className="w-3.5 h-3.5" />
                Orden de Servicio *
              </label>

              <button
                onClick={fetchServiceOrders}
                disabled={loadingOrders}
                className="text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingOrders ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            {/* loading */}
            {loadingOrders && (
              <div className="p-3 flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando órdenes...
              </div>
            )}

            {/* error */}
            {ordersError && (
              <div className="p-3 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                {ordersError}
              </div>
            )}

            {/* select */}
            {!loadingOrders && !ordersError && (
              <div className="relative">
                <select
                  value={serviceOrderId}
                  onChange={(e) => {
                    setServiceOrderId(e.target.value);
                    setError(null);
                  }}
                  disabled={loading || success}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 pr-10"
                >
                  <option value="">Selecciona una OS</option>

                  {serviceOrders.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.orderNumber} — {os.customerName}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            )}

            {/* preview */}
            {selectedOS && (
              <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-200 rounded-xl">

                <div className="w-2 h-2 rounded-full bg-indigo-500" />

                <div className="flex-1">
                  <p className="text-xs font-black text-indigo-600">
                    {selectedOS.orderNumber}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {selectedOS.details?.length
                      ? `${selectedOS.details.length} ítems`
                      : 'Sin detalles'}
                  </p>
                </div>

                <span className="text-[9px] font-bold uppercase text-indigo-600">
                  {selectedOS.status}
                </span>
              </div>
            )}
          </div>

          {/* reference */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">
              Referencia (opcional)
            </label>

            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3"
              placeholder="Ej: Lote camisas"
            />
          </div>

          {/* error */}
          {error && (
            <div className="text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* success */}
          {success && (
            <div className="text-green-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Orden creada!
            </div>
          )}

          {/* actions */}
          <div className="flex gap-3 pt-2">

            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || success || !serviceOrderId}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white"
            >
              {loading ? 'Creando...' : 'Crear OP'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}