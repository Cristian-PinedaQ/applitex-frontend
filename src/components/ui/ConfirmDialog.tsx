import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center gap-4">
          {/* Icono */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colors[variant].icon}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* Texto */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`py-3.5 text-sm font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95 ${colors[variant].btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
