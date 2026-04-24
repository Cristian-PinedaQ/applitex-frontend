import React from 'react';
import { Save, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SyncStatus } from '../hooks/useOrderOperations';

interface OrderActionsBarProps {
  total: number;
  onSave: () => void;
  onStatusChange?: (status: any) => void;
  status?: string;
  syncStatus: SyncStatus;
}

export const OrderActionsBar: React.FC<OrderActionsBarProps> = ({
  total, onSave, onStatusChange, status, syncStatus
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-8 flex justify-center pointer-events-none">
      <div className="w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[32px] p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto animate-in slide-in-from-bottom-10 duration-500">
        
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
            title="Volver al listado"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de la Orden</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">$ {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {status === 'DRAFT' && (
             <button
              onClick={() => onStatusChange?.('CREATED')}
              className="flex-1 md:flex-none px-6 py-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirmar Orden
            </button>
          )}

          <button
            onClick={onSave}
            disabled={syncStatus === 'SAVING' || syncStatus === 'IDLE'}
            className={`flex-1 md:flex-none px-10 py-4 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden ${
              syncStatus === 'DIRTY' || syncStatus === 'ERROR'
                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none ring-4 ring-indigo-500/20' 
                : syncStatus === 'SAVING'
                ? 'bg-indigo-400 text-white cursor-wait'
                : syncStatus === 'SYNCED'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-none'
            }`}
          >
            {syncStatus === 'SAVING' ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Sincronizando...
              </>
            ) : syncStatus === 'SYNCED' ? (
              <>
                <Check className="w-6 h-6" />
                Sincronizado
              </>
            ) : syncStatus === 'ERROR' ? (
              <>
                <AlertCircle className="w-6 h-6" />
                Error - Reintentar
              </>
            ) : (
              <>
                <Save className={`w-6 h-6 ${syncStatus === 'DIRTY' ? 'animate-bounce' : ''}`} />
                {syncStatus === 'DIRTY' ? 'Guardar Cambios' : 'Sin cambios'}
              </>
            )}
            
            {syncStatus === 'DIRTY' && (
              <div className="absolute top-0 right-0 p-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
