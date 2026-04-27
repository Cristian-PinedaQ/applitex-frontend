import api from '../config/api';

export interface DashboardStats {
  monthlySales: string; // Formato String para precisión BigDecimal
  activeProductionOrders: number;
  criticalStockItems: number;
  recentActivity: {
    id: string;
    eventType: string;
    eventTimestamp: string;
    description?: string;
    metadata?: Record<string, any>;
  }[];
  productionPerformance: {
    day: string;
    total: number;
  }[];
}

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};
