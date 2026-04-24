import React from 'react';
import { ShoppingBag, Calendar, Info, PlayCircle, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../../types/orders';

interface OrderHeaderProps {
  order: ServiceOrder;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: Info },
  CREATED: { label: 'Programada', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Calendar },
  IN_PROGRESS: { label: 'En Proceso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: PlayCircle },
  COMPLETED: { label: 'Finalizada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  DELIVERED: { label: 'Entregada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  CANCELLED: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle }
};

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const status = statusConfig[order.status] || statusConfig.CREATED;
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="flex items-center gap-6">
        <div className="p-4 bg-indigo-600 rounded-[24px] shadow-lg shadow-indigo-200 dark:shadow-none">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Orden {order.orderNumber}
            </h1>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Cliente: <span className="text-slate-900 dark:text-white font-bold">{order.customerName}</span>
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creada</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última Act.</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
