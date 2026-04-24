/**
 * Configuración de Feature Flags para el sistema.
 * Permite habilitar o deshabilitar módulos en desarrollo/producción.
 */
export const FEATURES = {
  ORDERS_V2: true, // Habilitado permanentemente tras certificación exitosa (23/04/2026)
  INVENTORY_SYNC: true,
  ADVANCED_ANALYTICS: false,
};
