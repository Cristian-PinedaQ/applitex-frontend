import api from '../config/api';
import { InventoryItem, InventoryItemRequest, InventoryItemAttribute, InventoryItemAttributeRequest, InventoryAdjustmentRequest, InventoryMovement, ActiveReservation } from '../types/inventory';

export const inventoryService = {
  // ─── Ítems de Inventario ───
  getAll: async (): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>('inventory');
    return res.data;
  },
  getByCustomer: async (customerId: string): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>(`customers/${customerId}/inventory`);
    return res.data;
  },
  getInventory: async (signal?: AbortSignal): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>('inventory', { signal });
    return res.data;
  },
  getInventoryByCustomer: async (customerId: string, signal?: AbortSignal): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>(`customers/${customerId}/inventory`, { signal });
    return res.data;
  },
  getInventoryById: async (id: string, signal?: AbortSignal): Promise<InventoryItem> => {
    const res = await api.get<InventoryItem>(`inventory/${id}`, { signal });
    return res.data;
  },
  createInventoryItem: async (data: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.post<InventoryItem>('inventory', data);
    return res.data;
  },
  updateInventoryItem: async (id: string, data: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.put<InventoryItem>(`inventory/${id}`, data);
    return res.data;
  },
  deleteInventoryItem: async (id: string): Promise<void> => {
    await api.delete(`inventory/${id}`);
  },
  adjustQuantity: async (id: string, data: InventoryAdjustmentRequest): Promise<InventoryItem> => {
    const res = await api.patch<InventoryItem>(`inventory/${id}/adjust-quantity`, data);
    return res.data;
  },
  getMovements: async (id: string, signal?: AbortSignal): Promise<InventoryMovement[]> => {
    const res = await api.get<InventoryMovement[]>(`inventory/${id}/movements`, { signal });
    return res.data;
  },
  getReservations: async (id: string, signal?: AbortSignal): Promise<ActiveReservation[]> => {
    const res = await api.get<ActiveReservation[]>(`inventory/${id}/reservations`, { signal });
    return res.data;
  },

  // ─── Atributos de Inventario ───
  getAttributes: async (): Promise<InventoryItemAttribute[]> => {
    const res = await api.get<InventoryItemAttribute[]>('inventory/attributes');
    return res.data;
  },
  getAttributesByItem: async (itemId: string): Promise<InventoryItemAttribute[]> => {
    const res = await api.get<InventoryItemAttribute[]>(`inventory/${itemId}/attributes`);
    return res.data;
  },
  createAttribute: async (itemId: string, data: InventoryItemAttributeRequest): Promise<InventoryItemAttribute> => {
    const res = await api.post<InventoryItemAttribute>(`inventory/${itemId}/attributes`, data);
    return res.data;
  },
  updateAttribute: async (id: string, data: InventoryItemAttributeRequest): Promise<InventoryItemAttribute> => {
    const res = await api.put<InventoryItemAttribute>(`inventory-attributes/${id}`, data);
    return res.data;
  },
  deleteAttribute: async (id: string): Promise<void> => {
    await api.delete(`inventory-attributes/${id}`);
  },
};
