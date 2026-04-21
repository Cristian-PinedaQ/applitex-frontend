import { X, Pencil, Trash2, Tag, ArrowUpRight, ArrowDownRight, User, Package, Calendar, Info } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryDetailModal({ item, isOpen, onClose, onEdit, onAdjust, onDelete }: InventoryDetailModalProps) {
  if (!isOpen || !item) return null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  const formatDate = (date?: string) => 
    date ? new Date(date).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-primary-600 bg-primary-100 px-2 py-0.5 rounded-lg tracking-wider">
                {item.reference}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate">{item.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 ml-3"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Stock Inicial</div>
              <div className="text-lg font-bold text-slate-600">{item.initialQuantity}</div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-4 text-center ring-2 ring-primary-100">
              <div className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-1">Stock Actual</div>
              <div className="text-2xl font-black text-primary-700">{item.finalQuantity}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Precio Unit.</div>
              <div className="text-lg font-bold text-slate-800">{formatPrice(item.price)}</div>
            </div>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Cliente</div>
                <div className="text-sm font-bold text-slate-800">{item.customerName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Categoría</div>
                <div className="text-sm font-bold text-slate-800">{item.categoryName}</div>
              </div>
            </div>
          </div>

          {/* Detalles */}
          {item.detail && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Detalles Adicionales</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{item.detail}</p>
            </div>
          )}

          {/* Atributos Dinámicos */}
          {item.attributes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Especificaciones Técnicas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.attributes.map((attr) => (
                  <div key={attr.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">{attr.attributeKey}</span>
                    <span className="text-xs font-bold text-slate-900">{attr.attributeValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auditoría */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Creado: {formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>Por: {item.createdBy || 'Sistema'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Últ. Modif: {formatDate(item.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>Por: {item.updatedBy || 'Sistema'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-slate-100 space-y-3">
          <button
            onClick={() => onAdjust(item)}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4" />
            Realizar Ajuste de Stock
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Ítem
            </button>
            <button
              onClick={() => onEdit(item)}
              className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-[0.98]"
            >
              <Pencil className="w-4 h-4" />
              Editar Ítem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
