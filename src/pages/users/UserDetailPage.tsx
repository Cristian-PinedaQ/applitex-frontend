import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Mail, 
  Shield, 
  Calendar, 
  Loader2, 
  Save, 
  Trash2,
  Activity,
  User as UserIcon,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserRequest } from '../../types/users';
import { usersService } from '../../services/users.service';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isKeyboardVisible = useKeyboardVisible();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Estado local para edición "Inline"
  const [editData, setEditData] = useState<UserRequest>({
    fullName: '',
    email: '',
    role: 'ROLE_OPERATOR',
    password: ''
  });

  const loadUser = async (signal?: AbortSignal) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await usersService.getById(id, signal);
      setUser(data);
      setEditData({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        password: ''
      });
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError('No se pudo cargar la información del usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadUser(controller.signal);
    
    return () => controller.abort();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await usersService.update(id, editData);
      await loadUser();
      // Feedback visual opcional aquí
    } catch (err) {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('¿Estás seguro de que deseas eliminar este miembro?')) return;
    try {
      await usersService.delete(id);
      navigate('/users');
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando expediente...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[40px] border border-rose-100">
        <p className="text-rose-600 font-bold">{error || 'Usuario no encontrado'}</p>
        <button onClick={() => navigate('/users')} className="mt-4 text-indigo-600 font-bold underline">Volver a la lista</button>
      </div>
    );
  }

  const roleConfigs: Record<UserRole, { label: string, color: string, desc: string }> = {
    'ROLE_SUPER_ADMIN': { 
      label: 'Súper Administrador', 
      color: 'bg-purple-100 text-purple-700',
      desc: 'Control total de la infraestructura y multi-tenancy.'
    },
    'ROLE_ADMIN': { 
      label: 'Administrador', 
      color: 'bg-indigo-100 text-indigo-700',
      desc: 'Gestión total de la empresa actual y equipo.'
    },
    'ROLE_SUPERVISOR': { 
      label: 'Supervisor', 
      color: 'bg-blue-100 text-blue-700',
      desc: 'Control operativo de catálogo, órdenes e inventario.'
    },
    'ROLE_OPERATOR': { 
      label: 'Operador', 
      color: 'bg-slate-100 text-slate-700',
      desc: 'Registro de datos y visualización básica.'
    }
  };

  return (
    <>
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-32 md:pb-10"
    >
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
              {user.fullName}
            </h1>
            <p className="text-sm font-medium text-slate-400">Expediente de Equipo / ID: {user.id.substring(0, 8)}</p>
          </div>
        </div>

        {/* Acciones solo en Desktop en el header */}
        <div className="hidden md:flex items-center gap-3">
           <button 
            onClick={handleDelete}
            className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
            title="Eliminar Miembro"
           >
              <Trash2 className="w-5 h-5" />
           </button>
           <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
           >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cambios
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal (2/3 en Desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Información General */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                   <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Perfil del Miembro</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                   <input 
                    type="text" 
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico</label>
                   <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 font-bold border-2 border-transparent">
                      <Mail className="w-4 h-4" />
                      {user.email}
                   </div>
                </div>
             </div>
          </div>

          {/* Card: Gestión de Roles */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Seguridad y Permisos</h3>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {(Object.entries(roleConfigs) as [UserRole, any][]).map(([r, config]) => (
                  <button 
                    key={r}
                    onClick={() => setEditData({ ...editData, role: r })}
                    className={`flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all group text-left ${
                      editData.role === r 
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' 
                        : 'border-slate-50 dark:border-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl shadow-lg transition-all ${
                      editData.role === r ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'
                    }`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-lg font-black tracking-tight ${editData.role === r ? 'text-indigo-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {config.label}
                      </p>
                      <p className="text-xs font-medium text-slate-400 max-w-sm">{config.desc}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar de Información (1/3 en Desktop) */}
        <div className="space-y-8">
           
           {/* Card: Info Rápida */}
           <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
              <div className="absolute -right-10 -top-10 opacity-10">
                 <UserIcon size={200} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Estado del Miembro</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                       <span className="font-black tracking-tighter text-xl text-white">Activo en Sistema</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 py-6 border-t border-white/10">
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Miembro desde</p>
                       <p className="font-bold text-lg leading-tight">
                         {new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(new Date(user.createdAt))}
                       </p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                       <Calendar className="w-6 h-6" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Card: Historial Mock */}
           <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                 <History className="w-5 h-5 text-indigo-600" />
                 <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">Actividad Reciente</h4>
              </div>
              <div className="space-y-6">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex gap-4 relative">
                      {i !== 3 && <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-50 dark:bg-slate-800"></div>}
                      <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0 mt-1 flex items-center justify-center border-4 border-white dark:border-slate-900 z-10">
                         <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Inició sesión en Applitex</p>
                        <p className="text-[10px] text-slate-400 font-medium">Hace {i * 2} horas • Medellín, CO</p>
                      </div>
                   </div>
                 ))}
                 <button className="w-full py-4 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 rounded-2xl hover:bg-indigo-100 transition-colors uppercase tracking-widest">
                    Ver registro completo
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
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Cambios
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserDetailPage;
