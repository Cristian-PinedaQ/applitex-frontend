import { useState, useCallback, useEffect, useRef } from 'react';
import { ServiceOrderDetailRequest, ServiceOrder } from '../../../types/orders';
import { Product } from '../../../types/catalog';
import { ordersService } from '../../../services/orders.service';
import { toast } from 'react-hot-toast';
import { observability } from '../../../services/observability.service';

export type SyncStatus = 'IDLE' | 'DIRTY' | 'SAVING' | 'SYNCED' | 'ERROR';

/**
 * Hook para gestionar las operaciones complejas sobre una orden de servicio.
 * Maneja reconciliación por clientId para evitar duplicidad en actualizaciones optimistas.
 */
export const useOrderOperations = () => {
  const [details, setDetails] = useState<ServiceOrderDetailRequest[]>([]);
  const [version, setVersion] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [isConflict, setIsConflict] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const prevSyncStatus = useRef<SyncStatus>('IDLE');

  useEffect(() => {
    if (prevSyncStatus.current !== syncStatus) {
      observability.trackEvent('order_sync_fsm_transition', {
        from: prevSyncStatus.current,
        to: syncStatus,
        detailsCount: details.length,
        version
      });
      prevSyncStatus.current = syncStatus;
    }
  }, [syncStatus, details.length, version]);

  const reset = useCallback((order: ServiceOrder) => {
    setDetails(prev => {
      return order.details.map((d) => {
        const localMatch = prev.find(p => (d.clientId && p.clientId === d.clientId) || p.id === d.id);
        
        return {
          id: d.id,
          clientId: d.clientId || localMatch?.clientId || d.id,
          productId: d.productId,
          categoryId: d.categoryId,
          quantity: d.quantity,
          price: d.price,
          inventoryItemId: d.inventoryItemId,
          usedInventoryQuantity: d.usedInventoryQuantity,
          attributes: d.attributes.map(a => ({
            attributeKey: a.attributeKey,
            attributeValue: a.attributeValue
          }))
        };
      });
    });
    setVersion(order.version);
    setCustomerId(order.customerId);
    setIsConflict(false);
    setSyncStatus('IDLE');
  }, []);

  const addDetail = useCallback(() => {
    setDetails(prev => [...prev, {
      clientId: crypto.randomUUID(),
      productId: '',
      categoryId: '',
      quantity: 1,
      price: 0,
      attributes: []
    }]);
    setSyncStatus('DIRTY');
  }, []);

  const removeDetail = useCallback((clientId: string) => {
    setDetails(prev => prev.filter(d => d.clientId !== clientId));
    setSyncStatus('DIRTY');
  }, []);

  const updateDetail = useCallback((clientId: string, field: keyof ServiceOrderDetailRequest, value: any, products?: Product[]) => {
    setDetails(prev => {
      const index = prev.findIndex(d => d.clientId === clientId);
      if (index === -1) return prev;

      const newDetails = [...prev];
      const detail = { ...newDetails[index], [field]: value };

      if (field === 'categoryId') {
        detail.productId = '';
        detail.attributes = [];
      }

      if (field === 'productId' && products) {
        const product = products.find(p => p.id === value);
        if (product) {
          detail.price = product.price || 0;
          detail.attributes = product.attributes?.map(a => ({
            attributeKey: a.attributeKey,
            attributeValue: ''
          })) || [];
        }
      }

      newDetails[index] = detail;
      return newDetails;
    });
    setSyncStatus('DIRTY');
  }, []);

  const updateAttribute = useCallback((clientId: string, attrIndex: number, value: string) => {
    setDetails(prev => {
      const index = prev.findIndex(d => d.clientId === clientId);
      if (index === -1) return prev;

      const newDetails = [...prev];
      const detail = { ...newDetails[index] };
      detail.attributes = [...detail.attributes];
      detail.attributes[attrIndex] = { ...detail.attributes[attrIndex], attributeValue: value };
      newDetails[index] = detail;
      return newDetails;
    });
    setSyncStatus('DIRTY');
  }, []);

  const save = async (orderId: string, forceVersion?: number) => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID(); // Generamos el ID aquí para correlacionar manual
    
    setSyncStatus('SAVING');
    
    observability.trackEvent('order_save_started', {
      orderId,
      itemsCount: details.length,
      version: forceVersion !== undefined ? forceVersion : version,
      isOverwrite: forceVersion !== undefined
    }, { requestId });

    try {
      const versionToUse = forceVersion !== undefined ? forceVersion : version;
      
      const sanitizedDetails = details.map(d => ({
        ...d,
        quantity: isNaN(Number(d.quantity)) ? 0 : Number(d.quantity),
        price: isNaN(Number(d.price)) ? 0 : Number(d.price),
        usedInventoryQuantity: d.usedInventoryQuantity !== undefined 
          ? (isNaN(Number(d.usedInventoryQuantity)) ? 0 : Number(d.usedInventoryQuantity))
          : undefined
      }));

      // Pasamos el requestId explícitamente en los headers para que coincida con la telemetría
      const updated = await ordersService.update(orderId, { 
        details: sanitizedDetails, 
        version: versionToUse,
        customerId: customerId || undefined
      }, { headers: { 'X-Request-ID': requestId } });
      
      const duration = performance.now() - startTime;
      
      setSyncStatus(current => current === 'SAVING' ? 'SYNCED' : current);
      setVersion(updated.version);
      setIsConflict(false);
      
      observability.trackEvent('order_save_success', {
        orderId,
        newVersion: updated.version
      }, { requestId, durationMs: Math.round(duration) });

      toast.success('Cambios sincronizados');
      
      setTimeout(() => {
        setSyncStatus(current => current === 'SYNCED' ? 'IDLE' : current);
      }, 3000);
      
      return updated;
    } catch (err: any) {
      const duration = performance.now() - startTime;

      if (err.response?.status === 409) {
        setSyncStatus('ERROR');
        setIsConflict(true);
        
        observability.trackEvent('order_conflict_detected', {
          orderId,
          version
        }, { requestId, durationMs: Math.round(duration) });

        toast.error('Conflicto: La orden fue modificada por otro usuario.');
        return;
      }

      setSyncStatus('ERROR');
      
      observability.trackEvent('order_save_error', {
        orderId,
        errorCode: err.response?.status || 'NETWORK_ERROR',
        message: err.message
      }, { requestId, durationMs: Math.round(duration) });

      toast.error('Error de sincronización con el servidor');
      throw err;
    }
  };

  return {
    details,
    reset,
    addDetail,
    removeDetail,
    updateDetail,
    updateAttribute,
    save,
    syncStatus,
    isConflict,
    setIsConflict,
    version
  };
};
