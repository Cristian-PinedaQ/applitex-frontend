/**
 * ObservabilityService
 * Centraliza la telemetría del sistema.
 * Ahora incluye tabId para clasificación de conflictos y persistencia asíncrona.
 */
import api from '../config/api';

// Generar un ID único por pestaña/sesión de navegador
const TAB_ID = crypto.randomUUID().substring(0, 8);

type EventName = 
  | 'order_save_started' 
  | 'order_save_success' 
  | 'order_save_error' 
  | 'order_conflict_detected' 
  | 'order_conflict_resolved_reload' 
  | 'order_conflict_resolved_overwrite'
  | 'order_sync_fsm_transition'
  | 'inventory_save_started'
  | 'inventory_save_success'
  | 'inventory_save_error'
  | 'inventory_conflict_detected'
  | 'inventory_stock_adjust_started'
  | 'inventory_stock_adjust_success'
  | 'inventory_stock_adjust_error';

interface TelemetryEvent {
  name: EventName;
  properties?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  durationMs?: number;
  tabId: string;
}

class ObservabilityService {
  private static instance: ObservabilityService;

  private constructor() {}

  public static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  public async trackEvent(name: EventName, properties?: Record<string, any>, options?: { requestId?: string, durationMs?: number }) {
    const event: TelemetryEvent = {
      name,
      properties: {
        ...properties,
        tabId: TAB_ID // Incluimos el tabId en las propiedades para el backend
      },
      timestamp: new Date().toISOString(),
      requestId: options?.requestId,
      durationMs: options?.durationMs,
      tabId: TAB_ID
    };

    // Logging en consola
    const badgeColor = this.getBadgeColor(name);
    console.groupCollapsed(
      `%c TELEMETRY %c ${name}`,
      'background: #1e293b; color: #f8fafc; font-weight: bold; padding: 2px 4px; border-radius: 4px 0 0 4px;',
      `background: ${badgeColor}; color: white; font-weight: bold; padding: 2px 4px; border-radius: 0 4px 4px 0;`,
      `@ ${event.timestamp}`
    );
    if (properties || options) console.table({ ...properties, ...options, tabId: TAB_ID });
    console.groupEnd();

    this.sendToServer(event);
  }

  private async sendToServer(event: TelemetryEvent) {
    try {
      await api.post('telemetry/track', {
        name: event.name,
        requestId: event.requestId,
        durationMs: event.durationMs,
        properties: event.properties // El backend mapeará tabId desde aquí
      });
    } catch (err) {
      console.warn('⚠️ [OBSERVABILITY] No se pudo persistir el evento.');
    }
  }

  public trackError(error: Error, context?: Record<string, any>) {
    console.error('[OBSERVABILITY ERROR]', {
      message: error.message,
      context,
      tabId: TAB_ID
    });
  }

  private getBadgeColor(name: EventName): string {
    if (name.includes('error')) return '#ef4444';
    if (name.includes('conflict')) return '#f59e0b';
    if (name.includes('success')) return '#10b981';
    if (name.includes('started')) return '#6366f1';
    return '#64748b';
  }
}

export const observability = ObservabilityService.getInstance();
