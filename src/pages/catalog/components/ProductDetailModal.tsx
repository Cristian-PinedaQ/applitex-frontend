import { X, Pencil, Trash2, Tag, DollarSign, Boxes, TrendingUp } from 'lucide-react';
import { Product } from '../../../types/catalog';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onEdit, onDelete }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 truncate">{product.name}</h2>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-0.5 rounded-full inline-block mt-1">
              {product.categoryName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 ml-3"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Descripción */}
          {product.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Precio Unit.</div>
                <div className="text-base font-bold text-slate-800">{formatPrice(product.price)}</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Boxes className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Cantidad</div>
                <div className="text-base font-bold text-slate-800">{product.quantity}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-500 font-medium uppercase tracking-wider">Valor Total</div>
              <div className="text-xl font-bold text-emerald-700">{formatPrice(product.totalValue)}</div>
            </div>
          </div>

          {/* Atributos */}
          {product.attributes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Atributos</h4>
              <div className="space-y-2">
                {product.attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {attr.attributeKey}
                    </span>
                    <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg">
                      {attr.defaultValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button
            onClick={() => onDelete(product.id)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
