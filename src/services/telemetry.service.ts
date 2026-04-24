import api from '../config/api';

export interface HealthMetrics {
  total_operations: number;
  success_rate: number;
  conflict_rate: number;
  error_rate: number;
  avg_save_duration_ms: number;
  ux_reload_vs_overwrite: {
    reloads: number;
    overwrites: number;
  };
}

export const telemetryService = {
  getDashboard: async (): Promise<HealthMetrics> => {
    const response = await api.get<HealthMetrics>('telemetry/dashboard');
    return response.data;
  }
};
