import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Building2, 
  Calendar, 
  Loader2, 
  Save, 
  Trash2,
  Users as UsersIcon,
  Activity,
  ShieldAlert,
  Globe,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tenant, tenantsService } from '../../services/tenants.service';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const isKeyboardVisible = useKeyboardVisible();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const loadTenant = async (signal?: AbortSignal) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tenantsService.getById(id, signal);
      setTenant(data);
      setName(data.name);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError('No se pudo cargar la información de la empresa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadTenant(controller.signal);
    
    return () => controller.abort();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await tenantsService.update(id, { name });
      await loadTenant();
    } catch (err) {
      setError('Error al actualizar nombre');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('¿Estás seguro de que deseas desactivar esta empresa? Esta acción es irreversible.')) return;
    try {
      await tenantsService.delete(id);
      navigate('/tenants');
    } catch (err) {
      setError('Error al desactivar empresa');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sincronizando corporativo...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[40px] border border-rose-100 max-w-2xl mx-auto">
        <p className="text-rose-600 font-bold">{error || 'Empresa no encontrada'}</p>
        <button onClick={() => navigate('/tenants')} className="mt-4 text-indigo-600 font-bold underline px-6 py-2">Volver al panel principal</button>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl mx-auto space-y-8 pb-32 md:pb-10"
      >
        {/* Dynamic Master Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-4 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {tenant.name}
                 </h1>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                   tenant.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                 }`}>
                   {tenant.status}
                 </span>
              </div>
              <p className="text-sm font-bold text-slate-400 tracking-tight flex items-center gap-2 uppercase">
                 <Globe size={14} className="text-indigo-400" />
                 ID Corporativo: {tenant.id}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
             <button 
              onClick={handleDelete}
              className="flex items-center gap-2 p-4 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[22px] transition-all font-bold text-sm"
             >
                <Trash2 size={18} />
                <span className="hidden md:inline">Desactivar</span>
             </button>
             <button 
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-[22px] font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Aplicar Cambios
             </button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-[45px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-[22px] text-indigo-600">
                   <Building2 className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">Identidad Corporativa</h3>
                   <p className="text-sm text-slate-400 font-medium tracking-tight">Datos maestros de la instancia SaaS.</p>
                </div>
             </div>

             <div className="space-y-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Nombre Comercial</label>
                   <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-[28px] outline-none transition-all font-black text-xl text-slate-800 dark:text-white"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[35px] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fecha de Fundación</p>
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-500">
                            <Calendar size={20} />
                         </div>
                         <p className="text-lg font-black text-slate-900 dark:text-white">
                           {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(tenant.createdAt))}
                         </p>
                      </div>
                   </div>
                   <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[35px] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Usuarios Activos</p>
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-emerald-500">
                            <UsersIcon size={20} />
                         </div>
                         <p className="text-lg font-black text-slate-900 dark:text-white">12 Miembros <span className="text-xs font-bold text-slate-400 ml-1">/ 50 Max</span></p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[45px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-rose-50 dark:bg-rose-900/40 rounded-[22px] text-rose-600">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">Zona de Peligro</h3>
                   <p className="text-sm text-slate-400 font-medium tracking-tight">Acciones críticas del Master Admin.</p>
                </div>
             </div>
             
             <div className="p-8 border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/20 rounded-[35px] flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-black text-rose-900 dark:text-rose-100 text-lg">Inhabilitación de Instancia</h4>
                  <p className="text-sm text-rose-600/80 font-medium max-w-sm">Si desactivas esta empresa, todos los usuarios perderán acceso inmediato a sus datos.</p>
                </div>
                <button 
                  onClick={handleDelete}
                  className="w-full md:w-auto px-8 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                >
                  Confirmar Desactivación
                </button>
             </div>
          </div>
        </div>

        {/* Analytics & Stats Sidebar */}
        <div className="space-y-8">
           
           <div className="bg-indigo-600 rounded-[45px] p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                 <Activity size={240} />
              </div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Consumo General</p>
                    <Settings className="w-5 h-5 opacity-40 animate-spin-slow" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-4xl font-black tracking-tighter">94.2%</h4>
                    <p className="text-sm font-bold opacity-80">Capacidad de almacenamiento en uso</p>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[94%] shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                 </div>
                 <div className="pt-4 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black opacity-60 uppercase">Órdenes Hoy</p>
                       <p className="text-xl font-black tracking-tight">142</p>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div>
                       <p className="text-[10px] font-black opacity-60 uppercase">Uptime</p>
                       <p className="text-xl font-black tracking-tight">99.98%</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[45px] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-8">
                 <Activity className="w-5 h-5 text-indigo-600" />
                 <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-xl">Eventos Críticos</h4>
              </div>
              <div className="space-y-8">
                 {[
                   { t: 'Actualización de Perfil', h: '3m ago', c: 'bg-emerald-500' },
                   { t: 'Nuevos productos cargados', h: '45m ago', c: 'bg-indigo-500' },
                   { t: 'Intento de login fallido (Master Admin)', h: '2h ago', c: 'bg-rose-500' }
                 ].map((log, i) => (
                   <div key={i} className="flex gap-5">
                      <div className="flex flex-col items-center gap-1 mt-1">
                         <div className={`w-3 h-3 rounded-full ${log.c} shadow-md`}></div>
                         {i !== 2 && <div className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800"></div>}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">{log.t}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{log.h}</p>
                      </div>
                   </div>
                 ))}
                 <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all rounded-[22px] uppercase tracking-[0.2em]"
                 >
                    Ver Auditoría Completa
                 </button>
              </div>
           </div>

        </div>

      </div>
      </motion.div>

      {/* Sticky Bottom Bar for Mobile Actions */}
      <AnimatePresence>
        {!isDesktop && !isKeyboardVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 pb-safe glass-dark dark:glass-dark border-t border-white/10 z-50 flex gap-3"
          >
             <button 
                onClick={handleDelete}
                className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
             >
                <Trash2 className="w-6 h-6" />
             </button>
             <button 
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white font-black rounded-[22px] flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Aplicar Cambios
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TenantDetailPage;
