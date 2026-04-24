import React, { useEffect, useState } from 'react';
import { Activity, Shield, AlertCircle, Clock, Zap, BarChart3, AlertTriangle, Bell } from 'lucide-react';
import { telemetryService, HealthMetrics } from '../../services/telemetry.service';
import { motion, AnimatePresence } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, color, subtitle, isAlert }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${
      isAlert 
        ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800 shadow-[0_0_40px_-15px_rgba(244,63,94,0.3)]' 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${isAlert ? 'bg-rose-500 text-white' : `${color} bg-opacity-10 text-${color.split('-')[1]}-500`}`}>
        <Icon size={24} />
      </div>
      {isAlert && (
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter"
        >
          Crítico
        </motion.div>
      )}
    </div>
    <div className={`text-3xl font-black mb-1 tracking-tight ${isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
      {value}
    </div>
    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {title}
    </div>
    {subtitle && (
      <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium italic">
        {subtitle}
      </div>
    )}
  </motion.div>
);

export const HealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await telemetryService.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching health metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Activity className="animate-pulse text-blue-500" size={48} />
    </div>
  );

  const activeAlertsCount = Object.values(metrics.active_alerts).filter(Boolean).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 🚨 ALERT CENTER */}
      <AnimatePresence>
        {activeAlertsCount > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-10 bg-rose-500 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl shadow-rose-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black tracking-tight">Atención: Anomalías Detectadas</h3>
                <p className="text-rose-100 text-sm font-medium opacity-90">
                  Se han activado {activeAlertsCount} alertas automáticas basadas en thresholds operativos.
                </p>
              </div>
              <div className="hidden md:flex gap-2">
                {metrics.active_alerts.high_conflict_rate && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">Conflictos Altos</span>}
                {metrics.active_alerts.high_error_rate && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">Errores Críticos</span>}
                {metrics.active_alerts.high_latency && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">Latencia Degradada</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${activeAlertsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className={`text-xs font-black uppercase tracking-[0.2em] ${activeAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {activeAlertsCount > 0 ? 'Estado Crítico' : 'Sistema Operativo'}
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Panel de Salud <span className="text-blue-600">SyncCore</span>
          </h1>
        </div>
        <button 
          onClick={fetchMetrics}
          className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
        >
          <Zap size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Tasa de Éxito" 
          value={`${(metrics.success_rate * 100).toFixed(1)}%`}
          icon={Shield}
          color="bg-emerald-500"
          isAlert={metrics.active_alerts.high_error_rate}
        />
        <MetricCard 
          title="Conflictos (409)" 
          value={`${(metrics.conflict_rate * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          color="bg-amber-500"
          isAlert={metrics.active_alerts.high_conflict_rate}
        />
        <MetricCard 
          title="Latencia Media" 
          value={`${metrics.avg_save_duration_ms.toFixed(0)}ms`}
          icon={Clock}
          color="bg-blue-500"
          isAlert={metrics.active_alerts.high_latency}
        />
        <MetricCard 
          title="Operaciones" 
          value={metrics.total_operations}
          icon={Zap}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UX Signals & Classification */}
        <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={120} />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Clasificación de Conflictos</h3>
              <p className="text-slate-400 text-sm">Diagnóstico automático de colisiones</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
             <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="text-2xl font-black text-blue-400 mb-1">{metrics.ux_signals.reloads}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manual Reloads</div>
                <div className="mt-2 text-[9px] text-slate-400 italic">Usuario acepta versión remota</div>
             </div>
             <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="text-2xl font-black text-emerald-400 mb-1">{metrics.ux_signals.overwrites}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Force Overwrites</div>
                <div className="mt-2 text-[9px] text-slate-400 italic">Usuario fuerza versión local</div>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intensidad de Fricción</span>
               <span className={`text-lg font-black ${metrics.ux_signals.conflict_intensity > 0.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(metrics.ux_signals.conflict_intensity * 100).toFixed(1)}%
               </span>
            </div>
          </div>
        </div>

        {/* Health Summary */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <h3 className="text-2xl font-black mb-8 text-slate-900 dark:text-white tracking-tight">Checklist de Salud</h3>
           <div className="space-y-5">
              <HealthCheckItem 
                label="Tasa de Error Crítico" 
                status={metrics.error_rate < 0.05 ? 'success' : 'danger'} 
                value={`${(metrics.error_rate * 100).toFixed(1)}%`}
              />
              <HealthCheckItem 
                label="Latencia de Sincronización" 
                status={metrics.avg_save_duration_ms < 1500 ? 'success' : 'warning'} 
                value={`${metrics.avg_save_duration_ms.toFixed(0)}ms`}
              />
              <HealthCheckItem 
                label="Colisiones de Concurrencia" 
                status={metrics.conflict_rate < 0.1 ? 'success' : 'warning'} 
                value={`${(metrics.conflict_rate * 100).toFixed(1)}%`}
              />
              <HealthCheckItem 
                label="Disponibilidad de Red" 
                status="success" 
                value="ONLINE"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthCheckItem = ({ label, status, value }: any) => (
  <div className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${
        status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
        status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
        'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
      }`} />
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
    </div>
    <span className={`text-xs font-black px-3 py-1 rounded-lg ${
      status === 'success' ? 'bg-emerald-100 text-emerald-700' : 
      status === 'warning' ? 'bg-amber-100 text-amber-700' : 
      'bg-rose-100 text-rose-700'
    }`}>
      {value}
    </span>
  </div>
);
