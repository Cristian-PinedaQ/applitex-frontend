import { Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import { Customer } from '../../../types/customer';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="glass dark:glass-dark rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">No se encontraron clientes</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Prueba ajustando los filtros o crea uno nuevo.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden glass dark:glass-dark rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-700/50">
            {customers.map((customer) => (
              <tr 
                key={customer.id} 
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{customer.fullName}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs">{customer.businessName || 'Sin nombre comercial'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <span className="text-slate-400 dark:text-slate-500 text-xs mr-1">{customer.documentType}</span>
                    {customer.document}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase
                    ${customer.customerType === 'EMPRESA' 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                      : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'}
                  `}>
                    {customer.customerType === 'EMPRESA' ? 'Empresa' : 'Persona'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`
                    flex items-center gap-1.5 text-xs font-bold
                    ${customer.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}
                  `}>
                    <span className={`w-2 h-2 rounded-full ${customer.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {customer.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(customer)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(customer.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
