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
  attributes: InventoryItemAttribute[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItemRequest {
  categoryId: string;
  customerId: string;
  name: string;
  detail?: string;
  price: number;
  initialQuantity: number;
  attributes?: InventoryItemAttributeRequest[];
}

export interface InventoryAdjustmentRequest {
  amount: number; // puede ser positivo (suma) o negativo (resta)
}
