import { useState, useCallback } from 'react';
import { InventoryItem, InventoryItemRequest } from '../../../types/inventory';
import { observability } from '../../../services/observability.service';
import { inventoryService as invService } from '../../../services/inventory.service';

export type SyncState = 'IDLE' | 'DIRTY' | 'SAVING' | 'SYNCED' | 'ERROR' | 'CONFLICT';
export type TransactionState = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

// Helper de sleep para backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useInventoryOperations = (initialItem: InventoryItem | null) => {
  // ─── Track 1: Metadata (FSM) ──────────────────────────────────────────────
  const [item, setItem] = useState<InventoryItem | null>(initialItem);
  const [state, setState] = useState<SyncState>('IDLE');
  const [lastSavedItem, setLastSavedItem] = useState<InventoryItem | null>(initialItem);
  
  // ─── Track 2: Stock (Transactional) ───────────────────────────────────────
  const [txState, setTxState] = useState<TransactionState>('IDLE');

  const updateMetadata = useCallback((updates: Partial<InventoryItemRequest>) => {
    setItem(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (state === 'IDLE' || state === 'SYNCED') {
        setState('DIRTY');
        observability.trackEvent('order_sync_fsm_transition', { from: state, to: 'DIRTY', module: 'inventory' });
      }
      return next;
    });
  }, [state]);

  const saveMetadata = useCallback(async () => {
    if (!item || state !== 'DIRTY') return;

    const requestId = crypto.randomUUID();
    setState('SAVING');
    observability.trackEvent('inventory_save_started', { itemId: item.id }, { requestId });

    try {
      const updated = await invService.updateInventoryItem(item.id, {
        name: item.name,
        detail: item.detail,
        price: item.price,
        categoryId: item.categoryId,
        customerId: item.customerId,
        version: item.version,
        attributes: item.attributes.map(a => ({ attributeKey: a.attributeKey, attributeValue: a.attributeValue }))
      });

      setState('SYNCED');
      setItem(updated);
      setLastSavedItem(updated);
      observability.trackEvent('inventory_save_success', { itemId: item.id }, { requestId });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setState('CONFLICT');
        observability.trackEvent('inventory_conflict_detected', { itemId: item.id }, { requestId });
      } else {
        setState('ERROR');
        observability.trackEvent('inventory_save_error', { itemId: item.id, error: err.message }, { requestId });
      }
      throw err;
    }
  }, [item, state]);

  // ─── Stock Adjust (Ledger-style with Exponential Backoff) ─────────────────
  const adjustStock = useCallback(async (amount: number, type: string, reason: string, retryCount = 0): Promise<InventoryItem | undefined> => {
    if (!item) return;

    // Idempotencia: requestId persistente por operacion logica
    const requestId = (window as any)._currentStockRequestId || crypto.randomUUID();
    (window as any)._currentStockRequestId = requestId;

    setTxState('PROCESSING');
    if (retryCount === 0) {
      observability.trackEvent('inventory_stock_adjust_started', { itemId: item.id, amount, type }, { requestId });
    }

    try {
      const result = await invService.adjustQuantity(item.id, { 
        amount, 
        type, 
        reason,
        requestId 
      });

      setItem(prev => prev ? { 
        ...prev, 
        finalQuantity: result.finalQuantity, 
        reservedQuantity: result.reservedQuantity,
        availableQuantity: result.availableQuantity,
        version: result.version 
      } : prev);
      setLastSavedItem(prev => prev ? { 
        ...prev, 
        finalQuantity: result.finalQuantity, 
        reservedQuantity: result.reservedQuantity,
        availableQuantity: result.availableQuantity,
        version: result.version 
      } : prev);
      
      setTxState('SUCCESS');
      observability.trackEvent('inventory_stock_adjust_success', { itemId: item.id, newStock: result.finalQuantity, retries: retryCount }, { requestId });
      
      delete (window as any)._currentStockRequestId;
      setTimeout(() => setTxState('IDLE'), 2000);
      return result;
    } catch (err: any) {
      // 🚨 AUTO-RETRY CON BACKOFF EXPONENCIAL
      if (err.response?.status === 409 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 50; // 50ms, 100ms, 200ms
        observability.trackEvent('inventory_stock_conflict_auto_resolve' as any, { itemId: item.id, retry: retryCount + 1, delay });
        
        await sleep(delay);
        return adjustStock(amount, type, reason, retryCount + 1);
      }

      setTxState('ERROR');
      observability.trackEvent('inventory_stock_adjust_error', { itemId: item.id, error: err.message, retries: retryCount }, { requestId });
      delete (window as any)._currentStockRequestId;
      throw err;
    }
  }, [item]);

  const resolveConflict = useCallback((resolvedItem: InventoryItem) => {
    setItem(resolvedItem);
    setLastSavedItem(resolvedItem);
    setState('IDLE');
  }, []);

  return {
    item,
    state,
    txState,
    updateMetadata,
    saveMetadata,
    adjustStock,
    resolveConflict,
    isDirty: state === 'DIRTY',
    isSaving: state === 'SAVING' || txState === 'PROCESSING'
  };
};
