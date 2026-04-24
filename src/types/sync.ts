/**
 * Deterministic Synchronization & Data Consistency Types
 */

// 1. Prevención de Scope Explosion: Scopes Canónicos estáticos
export type SyncScope = 
  | 'users:list'
  | 'users:search'
  | 'tenants:list'
  | 'tenants:search'
  | 'customers:list'
  | 'customers:search'
  | 'catalog:list'
  | 'catalog:search'
  | 'inventory:list'
  | 'inventory:search'
  | 'orders:list'
  | 'orders:search';

// Tipos base para ayudar al analizador estático en los genéricos
export type ActionType = 'PATCH' | 'REPLACE';
export type FieldPolicy<T> = Partial<Record<keyof T, ActionType>>;

/**
 * 2. Contrato Explícito de SWR Merge
 * Dicta cómo debe comportarse el frontend al refrescar datos en background ("Stale While Revalidate").
 * - PATCH: Se pueden parchar con merges superficiales o se asume estabilidad temporal para evitar parpadeos visuales en campos no crpiticos.
 * - REPLACE: Campos de seguridad y permisos que deben reescribirse íntegramente obligando un update estricto de UI. 
 */
export const USER_FIELD_POLICY: FieldPolicy<any> = {
  // PATCH: Estéticos o referenciales
  fullName: 'PATCH',
  email: 'PATCH',
  createdAt: 'PATCH',
  
  // REPLACE: Críticos para la seguridad y control de acceso
  id: 'REPLACE',
  role: 'REPLACE',
  password: 'REPLACE',
};

export const TENANT_FIELD_POLICY: FieldPolicy<any> = {
  name: 'PATCH',
  createdAt: 'PATCH',
  
  id: 'REPLACE',
  status: 'REPLACE',
};

export const CUSTOMER_FIELD_POLICY: FieldPolicy<any> = {
  // PATCH: Actualizaciones estéticas para UX fluida
  fullName: 'PATCH',
  email: 'PATCH',
  phone: 'PATCH',
  businessName: 'PATCH',
  address: 'PATCH',
  city: 'PATCH',
  
  // REPLACE: Identificadores jurídicos o estructurales
  id: 'REPLACE',
  document: 'REPLACE',
  documentType: 'REPLACE',
  customerType: 'REPLACE',
  active: 'REPLACE',
};

export const CATALOG_FIELD_POLICY: FieldPolicy<any> = {
  // PATCH: Campos estéticos o informativos
  name: 'PATCH',
  description: 'PATCH',
  categoryName: 'PATCH',
  attributes: 'PATCH',

  // REPLACE: Identificadores económicos y de inventario críticos
  id: 'REPLACE',
  categoryId: 'REPLACE',
  price: 'REPLACE',
  quantity: 'REPLACE',
  totalValue: 'REPLACE',
};

/**
 * INVENTORY_FIELD_POLICY
 * Estrategia server-authoritative para finalQuantity:
 * - finalQuantity NUNCA se edita como estado local.
 *   Depende exclusivamente de eventos de transacción confirmados por el servidor.
 * - id y customerId son immutable.
 * - attributes admite merge-deep (PATCH).
 */
export const INVENTORY_FIELD_POLICY: FieldPolicy<any> = {
  // IMMUTABLE: Identificadores estructurales
  id: 'REPLACE',
  customerId: 'REPLACE',
  categoryId: 'REPLACE',

  // SERVER-AUTHORITATIVE: Cantidad crítica de negocio.
  // ⚠️ Nunca mutar optimistamente. Siempre sincronizar desde respuesta del servidor.
  finalQuantity: 'REPLACE',
  initialQuantity: 'REPLACE',

  // LAST-WRITE-WINS: Campos estéticos o referenciales
  name: 'PATCH',
  detail: 'PATCH',
  reference: 'PATCH',
  categoryName: 'PATCH',
  customerName: 'PATCH',
  price: 'REPLACE',

  // MERGE-DEEP: Atributos dinámicos del ítem
  attributes: 'PATCH',

  // SERVER-TIMESTAMP: Siempre desde servidor
  updatedAt: 'REPLACE',
  createdAt: 'REPLACE',
};

/**
 * ORDERS_FIELD_POLICY
 * Estrategia industrial para órdenes de servicio:
 * - id, orderNumber y customerId son inmutables.
 * - status es autoritativo del servidor.
 * - details permite PATCH para merges granulares de ítems.
 */
export const ORDERS_FIELD_POLICY: FieldPolicy<any> = {
  // IMMUTABLE / STRUCTURAL
  id: 'REPLACE',
  orderNumber: 'REPLACE',
  customerId: 'REPLACE',

  // SERVER-AUTHORITATIVE
  status: 'REPLACE',

  // GRANULAR MERGE
  details: 'PATCH',

  // LAST-WRITE-WINS
  customerName: 'PATCH',
  createdBy: 'REPLACE',
  updatedBy: 'REPLACE',
  
  // TIMESTAMPS
  createdAt: 'REPLACE',
  updatedAt: 'REPLACE',
};

