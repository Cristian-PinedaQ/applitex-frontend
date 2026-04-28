import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { OrderHeader } from './components/OrderHeader';
import { OrderDetailsList } from './components/OrderDetailsList';
import { OrderActionsBar } from './components/OrderActionsBar';
import { ordersService } from '../../services/orders.service';
import { catalogService } from '../../services/catalog.service';
import { inventoryService } from '../../services/inventory.service';
import { useOrderOperations } from './hooks/useOrderOperations';
import { XCircle } from 'lucide-react';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { toast } from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // -------------------------
  // ORDER
  // -------------------------
  const { data: order, error: orderError, mutate: mutateOrder } = useSWR(
    id ? ['orders', id] : null,
    ([, orderId]: [string, string]) => ordersService.getById(orderId) // ✅ sin signal
  );

  // -------------------------
  // CATALOG
  // -------------------------
  const { data: categories } = useSWR(
    'catalog/categories',
    () => catalogService.getCategories()
  );

  const { data: products } = useSWR(
    'catalog/products',
    () => catalogService.getProducts()
  );

  // -------------------------
  // INVENTORY (dependiente de order)
  // -------------------------
  const { data: inventoryItems } = useSWR(
    order?.customerId ? ['inventory', order.customerId] : null,
    ([, customerId]: [string, string]) => inventoryService.getInventoryByCustomer(customerId) // ✅ sin signal
  );

  // -------------------------
  // ORDER OPERATIONS
  // -------------------------
  const {
    details,
    syncStatus,
    reset,
    addDetail,
    removeDetail,
    updateDetail,
    updateAttribute,
    save,
    isConflict,
    setIsConflict
  } = useOrderOperations();

  const [isResolving, setIsResolving] = React.useState(false);

  // Sincronizar estado local
  useEffect(() => {
    if (order) reset(order);
  }, [order, reset]);

  // -------------------------
  // HANDLERS
  // -------------------------
  const handleSave = async () => {
    if (!id) return;
    const updated = await save(id);
    if (updated) mutateOrder(updated, false);
  };

  const handleReload = async () => {
    setIsResolving(true);
    setIsConflict(false);

    const loadingToast = toast.loading('Cargando versión más reciente...');

    try {
      const freshData = await mutateOrder();
      if (freshData) {
        reset(freshData);
        toast.success('Versión actualizada', { id: loadingToast });
      }
    } finally {
      setIsResolving(false);
    }
  };

  const handleOverwrite = async () => {
    if (!id) return;

    setIsResolving(true);
    setIsConflict(false);

    const loadingToast = toast.loading('Sobrescribiendo servidor...');

    try {
      const freshOrder = await ordersService.getById(id);

      const updated = await save(id, freshOrder.version);

      if (updated) {
        mutateOrder(updated, false);
        toast.success('Servidor sobrescrito con éxito', {
          id: loadingToast
        });
      }
    } catch (err) {
      toast.error('Error al intentar sobrescribir', {
        id: loadingToast
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!id) return;

    try {
      const updated = await ordersService.updateStatus(id, newStatus);
      mutateOrder(updated, false);
    } catch {
      // manejado globalmente
    }
  };

  // -------------------------
  // ERROR UI
  // -------------------------
  if (orderError) {
    console.error('❌ [OrderDetailPage] SWR Error:', orderError);

    return (
      <div className="p-20 text-center">
        <div className="inline-flex p-6 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-6">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Error al cargar la orden
        </h2>

        <p className="text-slate-500 mb-8">
          No pudimos recuperar la información técnica en este momento.
        </p>

        <button
          onClick={() => navigate('/orders')}
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl"
        >
          Volver al Listado
        </button>
      </div>
    );
  }

  // -------------------------
  // LOADING
  // -------------------------
  if (!order) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-8" />
        <div className="w-64 h-8 bg-slate-100 dark:bg-slate-800 rounded-full mb-4" />
        <div className="w-48 h-4 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
    );
  }

  // -------------------------
  // TOTAL
  // -------------------------
  const total = details.reduce(
    (acc, d) => acc + d.quantity * d.price,
    0
  );

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <OrderHeader order={order} />

        <OrderDetailsList
          details={details}
          categories={categories || []}
          products={products || []}
          inventoryItems={inventoryItems || []}
          onAdd={addDetail}
          onRemove={removeDetail}
          onChange={(clientId, field, value) =>
            updateDetail(clientId, field, value, products)
          }
          onAttributeChange={updateAttribute}
        />

        <OrderActionsBar
          total={total}
          onSave={handleSave}
          onStatusChange={handleStatusChange}
          status={order.status}
          syncStatus={syncStatus}
        />

        <ConflictResolutionModal
          isOpen={isConflict}
          onClose={() => setIsConflict(false)}
          onReload={handleReload}
          onOverwrite={handleOverwrite}
          isResolving={isResolving}
        />
      </div>
    </div>
  );
};

export default OrderDetailPage;