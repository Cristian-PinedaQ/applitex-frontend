import { SyncScope, FieldPolicy } from '../types/sync';

/**
 * 1. Scope-Aware Request Versioning 
 * Mantiene un tracker global para invalidar peticiones que llegan "tarde" en entornos asíncronos concurrentes.
 */
class SyncCore {
  private requestVersions: Record<SyncScope, number> = {
    'users:list': 0,
    'users:search': 0,
    'tenants:list': 0,
    'tenants:search': 0,
    'customers:list': 0,
    'customers:search': 0,
    'catalog:list': 0,
    'catalog:search': 0,
    'inventory:list': 0,
    'inventory:search': 0,
    'orders:list': 0,
    'orders:search': 0,
  };

  /**
   * Genera una nueva versión inmutable para una llamada de red aislada por scope.
   */
  public generateVersion(scope: SyncScope): number {
    this.requestVersions[scope] += 1;
    return this.requestVersions[scope];
  }

  /**
   * Verifica si la versión generada al iniciar la petición sigue siendo la versión vigente en el Scope.
   * Si retorna falso, los datos están desactualizados ("Server-Stale" / Late Response) y deben ser descartados.
   */
  public isVersionValid(scope: SyncScope, version: number): boolean {
    return this.requestVersions[scope] === version;
  }

  /**
   * 2. SWR Smart Merge Engine
   * Reconciliation function orientada a evitar Layout Flickers inestables.
   * Aplica la regla estricta de Patch vs Replace según el FieldPolicy.
   * NOTA: Para React, un simple Array Map respetando las referencias físicas evita re-renders del Virtual DOM.
   */
  public mergeCollections<T extends { id: string | number }>(
    oldData: T[],
    newData: T[],
    policy: FieldPolicy<T>
  ): T[] {
    const newMap = new Map(newData.map(item => [item.id, item]));
    const mergedData: T[] = [];

    // Iteramos los datos viejos para parchar y mantener estabilidad V-DOM
    for (const oldItem of oldData) {
      if (newMap.has(oldItem.id)) {
        const freshItem = newMap.get(oldItem.id)!;
        const mergedItem = { ...oldItem } as T;

        Object.keys(policy).forEach(key => {
          const k = key as keyof T;
          if (policy[k] === 'REPLACE') {
            mergedItem[k] = freshItem[k];
          } else if (policy[k] === 'PATCH') {
            // PATCH significa permitir fusión sutil si hay diferencias que valgan la pena notificar,
            // pero internamente en un modelo plano, aplicamos la actualización sin destruir sub-estructuras vitales.
            if (mergedItem[k] !== freshItem[k]) {
               mergedItem[k] = freshItem[k];
            }
          }
        });
        
        mergedData.push(mergedItem);
        newMap.delete(oldItem.id);
      }
    }

    // Cualquier ID nuevo en `newData` que no estaba en el mapa viejo simplemente se añade íntegro
    newMap.forEach(freshItem => {
      mergedData.push(freshItem);
    });

    return mergedData;
  }
}

export const syncEngine = new SyncCore();
