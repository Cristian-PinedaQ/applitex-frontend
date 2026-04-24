export interface InventoryItemAttribute {
  id: string;
  itemId: string;
  itemName: string;
  attributeKey: string;
  attributeValue: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItemAttributeRequest {
  attributeKey: string;
  attributeValue: string;
}

export interface InventoryItem {
  id: string;
  categoryId: string;
  categoryName: string;
  customerId: string;
  customerName: string;
  reference: string;
  name: string;
  detail?: string;
  price: number;
  initialQuantity: number;
  finalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  attributes: InventoryItemAttribute[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  version: number;
}

export interface InventoryItemRequest {
  categoryId: string;
  customerId: string;
  name: string;
  detail?: string;
  price: number;
  initialQuantity: number;
  attributes?: InventoryItemAttributeRequest[];
  version?: number;
}

export interface InventoryAdjustmentRequest {
  amount: number;
  type?: string;
  reason?: string;
  requestId?: string;
  reservationId?: string;
}

export interface InventoryMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'RESERVE' | 'RELEASE' | 'COMMIT' | 'REPAIR_ADJUSTMENT';
  amount: number;
  previousQuantity: number;
  finalQuantity: number;
  reason: string;
  requestId: string;
  referenceRequestId?: string;
  createdAt: string;
  createdBy: string;
}
