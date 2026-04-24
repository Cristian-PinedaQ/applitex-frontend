import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Save, Info } from 'lucide-react';
import { observability } from '../../../services/observability.service';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  onOverwrite: () => void;
  isResolving?: boolean;
  resourceName?: string;
  module?: 'order' | 'inventory';
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  onReload,
  onOverwrite,
  isResolving = false,
  resourceName = 'El recurso',
  module = 'order'
}) => {
  const handleReload = () => {
    const eventName = module === 'order' ? 'order_conflict_resolved_reload' : 'inventory_conflict_resolved_reload' as any;
    observability.trackEvent(eventName);
    onReload();
  };

  const handleOverwrite = () => {
    const eventName = module === 'order' ? 'order_conflict_resolved_overwrite' : 'inventory_conflict_resolved_overwrite' as any;
    observability.trackEvent(eventName);
    onOverwrite();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100]"
            onClick={!isResolving ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[101] overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 shadow-inner">
                  <AlertTriangle size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Conflictos de Sincronización
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-[280px]">
                  {resourceName} ha cambiado en el servidor mientras editabas.
                </p>
              </div>

              <div className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-8 border border-slate-100 dark:border-slate-700/50">
                <div className="text-slate-400 shrink-0">
                  <span className="flex items-center justify-center w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full text-[10px] font-bold">i</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Para proteger la integridad de los datos, el sistema ha bloqueado el guardado. Debes decidir qué versión es la correcta.
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={handleReload}
                  disabled={isResolving}
                  className="group relative flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 text-left disabled:opacity-50"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <RefreshCw size={24} className={isResolving ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Cargar Versión Remota</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Descarta tus cambios locales y ve lo más reciente.</div>
                  </div>
                </button>

                <button
                  onClick={handleOverwrite}
                  disabled={isResolving}
                  className="group relative flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 text-left disabled:opacity-50"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Save size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Sobrescribir Servidor</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Tus cambios son la prioridad. Fuerza tu versión.</div>
                  </div>
                </button>
              </div>

              {!isResolving && (
                <button
                  onClick={onClose}
                  className="mt-8 w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors tracking-widest uppercase"
                >
                  Continuar editando (Sin guardar)
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
