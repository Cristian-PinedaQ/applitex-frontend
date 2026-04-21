import api from '../config/api';
import { InventoryItem, InventoryItemRequest, InventoryItemAttribute, InventoryItemAttributeRequest, InventoryAdjustmentRequest } from '../types/inventory';

export const inventoryService = {
  // ─── Ítems de Inventario ───
  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>('/inventory');
    return res.data;
  },
  getInventoryByCustomer: async (customerId: string): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>(`/customers/${customerId}/inventory`);
    return res.data;
  },
  getInventoryById: async (id: string): Promise<InventoryItem> => {
    const res = await api.get<InventoryItem>(`/inventory/${id}`);
    return res.data;
  },
  createInventoryItem: async (data: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.post<InventoryItem>('/inventory', data);
    return res.data;
  },
  updateInventoryItem: async (id: string, data: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.put<InventoryItem>(`/inventory/${id}`, data);
    return res.data;
  },
  deleteInventoryItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
  adjustQuantity: async (id: string, data: InventoryAdjustmentRequest): Promise<InventoryItem> => {
    const res = await api.patch<InventoryItem>(`/inventory/${id}/adjust-quantity`, data);
    return res.data;
  },

  // ─── Atributos de Inventario ───
  getAttributes: async (): Promise<InventoryItemAttribute[]> => {
    const res = await api.get<InventoryItemAttribute[]>('/inventory/attributes');
    return res.data;
  },
  getAttributesByItem: async (itemId: string): Promise<InventoryItemAttribute[]> => {
    const res = await api.get<InventoryItemAttribute[]>(`/inventory/${itemId}/attributes`);
    return res.data;
  },
  createAttribute: async (itemId: string, data: InventoryItemAttributeRequest): Promise<InventoryItemAttribute> => {
    const res = await api.post<InventoryItemAttribute>(`/inventory/${itemId}/attributes`, data);
    return res.data;
  },
  updateAttribute: async (id: string, data: InventoryItemAttributeRequest): Promise<InventoryItemAttribute> => {
    const res = await api.put<InventoryItemAttribute>(`/inventory-attributes/${id}`, data);
    return res.data;
  },
  deleteAttribute: async (id: string): Promise<void> => {
    await api.delete(`/inventory-attributes/${id}`);
  },
};
