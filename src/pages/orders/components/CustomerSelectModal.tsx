import React, { useState } from 'react';
import { X, User, Search, ArrowRight } from 'lucide-react';
import { Customer } from '../../../types/customer';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSelect: (customerId: string) => void;
  loading?: boolean;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen, onClose, customers, onSelect, loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nueva Orden de Servicio</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Selecciona el cliente para iniciar el borrador.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar por nombre o NIT..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filtered.map(customer => (
              <button
                key={customer.id}
                disabled={loading}
                onClick={() => onSelect(customer.id)}
                className="w-full group p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[24px] flex items-center justify-between hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-600 transition-colors">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white">{customer.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{customer.document}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all translate-x-0 group-hover:translate-x-1" />
              </button>
            ))}
            
            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-bold italic">No se encontraron clientes...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
