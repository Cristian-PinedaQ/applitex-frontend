import React from 'react';
import { 
  Edit2, Trash2, Calendar, 
  User, Hash, CheckCircle2, 
  Clock, PlayCircle, Truck, XCircle 
} from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../../types/orders';

interface OrdersTableProps {
  orders: ServiceOrder[];
  onSelect: (order: ServiceOrder) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400', icon: Clock },
  CREATED: { label: 'Programada', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Calendar },
  IN_PROGRESS: { label: 'En Proceso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: PlayCircle },
  COMPLETED: { label: 'Finalizada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  DELIVERED: { label: 'Entregada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  CANCELLED: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle }
};

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, onSelect, onDelete, onStatusChange 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            <th className="px-6 py-4">Orden #</th>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 hidden md:table-cell">Fecha</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.CREATED;
            const StatusIcon = status.icon;

            return (
              <tr 
                key={order.id} 
                onClick={() => onSelect(order)}
                className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                {/* Order Number */}
                <td className="px-6 py-5 first:rounded-l-3xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                      <Hash className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{order.orderNumber}</span>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{order.customerName}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  <div 
                    className="relative group/status flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                    
                    {/* Status Dropdown / Quick Change (Small) */}
                    <div className="hidden group-hover/status:flex absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl p-1 z-20 min-w-[140px] flex-col">
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => onStatusChange(order.id, key as OrderStatus)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors"
                        >
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-5 hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-400 pl-4">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-right last:rounded-r-3xl">
                  <div 
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => onSelect(order)}
                      className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(order.id)}
                      className="px-2 py-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
