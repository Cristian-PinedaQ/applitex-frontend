import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building2, Shield, Calendar, Mail } from 'lucide-react';

export function DetailPlaceholder({ type }: { type: 'user' | 'tenant' }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver a la lista
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
             {type === 'user' ? <User className="w-12 h-12" /> : <Building2 className="w-12 h-12" />}
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {type === 'user' ? 'Perfil de Miembro' : 'Perfil de Empresa'}
              </h1>
              <p className="text-slate-500 font-medium text-lg">Visualizando registro: <span className="font-mono text-indigo-600">{id}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-slate-400 mb-2 font-black uppercase text-[10px] tracking-widest">
                    <Shield className="w-4 h-4" />
                    Estado de Seguridad
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">Verificado y Activo</p>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-slate-400 mb-2 font-black uppercase text-[10px] tracking-widest">
                    <Calendar className="w-4 h-4" />
                    Última Sincronización
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">Hoy, 21:50 PM</p>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[32px] border border-indigo-100 dark:border-indigo-900/20">
           <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-6 h-6" />
              <p className="font-bold">Este es un módulo de detalle generado para la arquitectura drill-down responsive. Los datos específicos de edición se cargarán aquí en la siguiente fase.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
