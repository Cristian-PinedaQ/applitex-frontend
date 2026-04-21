import React from 'react';
import { 
  X, ShoppingBag, User, Hash, 
  Calendar, ClipboardList, Info, 
  DollarSign, Calculator, Package,
  Layers, CheckCircle2, Clock, PlayCircle, Truck, XCircle
} from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../../types/orders';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: ServiceOrder;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  CREATED: { label: 'Programada', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Calendar },
  IN_PROGRESS: { label: 'En Proceso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: PlayCircle },
  COMPLETED: { label: 'Finalizada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  DELIVERED: { label: 'Entregada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  CANCELLED: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle }
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const status = statusConfig[order.status] || statusConfig.CREATED;
  const StatusIcon = status.icon;

  const totalOrder = order.details.reduce((acc, d) => acc + d.totalValue, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-[24px] shadow-lg shadow-indigo-200 dark:shadow-none">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Orden {order.orderNumber}
                </h2>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Detalle técnico y comercial de la orden de trabajo.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10">
          
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <User className="w-3 h-3" /> Cliente
              </label>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{order.customerName}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fecha de Creación
              </label>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {new Date(order.createdAt).toLocaleDateString()} 
                <span className="text-sm font-medium text-slate-400 ml-2">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
            <div className="p-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none">
              <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2 block flex items-center gap-2">
                <DollarSign className="w-3 h-3" /> Total de la Orden
              </label>
              <p className="text-2xl font-black text-white">$ {totalOrder.toLocaleString()}</p>
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            Ítems y Fichas Técnicas
          </h3>

          <div className="space-y-6">
            {order.details.map((detail, index) => (
              <div key={detail.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
                <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{detail.productName}</h4>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">{detail.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">$ {detail.totalValue.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{detail.quantity} un x $ {detail.price}</p>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left: Attributes */}
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-500" /> Especificaciones Técnicas
                    </h5>
                    {detail.attributes && detail.attributes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detail.attributes.map((attr) => (
                          <div key={attr.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50 transition-all hover:border-indigo-100">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{attr.attributeKey}</label>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{attr.attributeValue || '---'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No se definieron atributos para este producto.</p>
                    )}
                  </div>

                  {/* Right: Resources/Inventory */}
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" /> Recursos de Inventario
                    </h5>
                    {detail.inventoryItemName ? (
                      <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight mb-1">{detail.inventoryItemName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 rounded-lg">
                                CONSUMO REAL
                              </span>
                              <span className="text-sm font-black text-amber-800 dark:text-amber-400">
                                {detail.usedInventoryQuantity} unidades
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center">
                        <p className="text-xs text-slate-400 font-medium">No se vinculó materia prima.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex justify-between items-center">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest space-y-1">
            <p>Creado por: <span className="text-slate-600 dark:text-slate-300 ml-1">{order.createdBy}</span></p>
            {order.updatedBy && <p>Actualizado por: <span className="text-slate-600 dark:text-slate-300 ml-1">{order.updatedBy}</span></p>}
          </div>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-[20px] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none uppercase tracking-widest text-xs"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
