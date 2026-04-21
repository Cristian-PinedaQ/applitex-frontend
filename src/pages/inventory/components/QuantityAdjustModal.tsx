import { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';

interface QuantityAdjustModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (amount: number) => Promise<void>;
}

export function QuantityAdjustModal({ item, isOpen, onClose, onAdjust }: QuantityAdjustModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'addition' | 'subtraction'>('addition');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const finalAmount = type === 'addition' ? amount : -amount;
    
    // Validación local simple: evitar stock negativo
    if (type === 'subtraction' && item.finalQuantity < amount) {
      alert('La cantidad a restar supera el stock actual.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdjust(finalAmount);
      setAmount(0);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Ajustar Existencias</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">{item.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('addition')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'addition' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Sumar
            </button>
            <button
              type="button"
              onClick={() => setType('subtraction')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'subtraction' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Restar
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-4xl font-black text-center py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-900"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UDS</span>
            </div>

            <div className={`p-4 rounded-2xl flex items-start gap-3 ${type === 'addition' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                El stock pasará de <span className="font-bold">{item.finalQuantity}</span> a{' '}
                <span className="font-bold underline">
                  {type === 'addition' ? item.finalQuantity + (amount || 0) : item.finalQuantity - (amount || 0)}
                </span>{' '}
                unidades.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || amount <= 0}
            className={`w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
              type === 'addition' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 text-white' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-200 text-white'
            }`}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Ajuste'}
          </button>
        </form>
      </div>
    </div>
  );
}
