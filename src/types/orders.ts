export type OrderStatus = 'DRAFT' | 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export interface ServiceOrderDetailAttribute {
  id?: string;
  attributeKey: string;
  attributeValue: string;
}

export interface ServiceOrderDetail {
  id: string;
  clientId?: string;
  categoryId: string;
  categoryName: string;
  productId: string;
  productName: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  usedInventoryQuantity?: number;
  price: number;
  quantity: number;
  totalValue: number;
  attributes: ServiceOrderDetailAttribute[];
}

export interface ServiceOrder {
  id: string;

  customerId: string;
  customerName: string;

  orderNumber: string;
  status: OrderStatus;

  details: ServiceOrderDetail[];

  createdAt: string;
  updatedAt: string;

  createdBy: string;
  updatedBy: string;

  version: number;

  // ✅ NUEVO (SAFE OPTIONAL - no rompe backend actual)
  productionOrderId?: string;
}

export interface ServiceOrderDetailRequest {
  id?: string;
  clientId?: string;
  categoryId: string;
  productId: string;
  inventoryItemId?: string;
  usedInventoryQuantity?: number;
  price: number;
  quantity: number;
  attributes: {
    attributeKey: string;
    attributeValue: string;
  }[];
}

export interface ServiceOrderRequest {
  customerId: string;
  details: ServiceOrderDetailRequest[];
  version?: number;
}
