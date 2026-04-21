import { Hash, User, Package, Box } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';

interface InventoryCardProps {
  item: InventoryItem;
  onClick: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  // Determinar color basado en stock (simple indicador)
  const isLowStock = item.finalQuantity < (item.initialQuantity * 0.1);
  const stockColor = isLowStock ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50';

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full text-left bg-white rounded-3xl border border-slate-200/80 p-5 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden"
    >
      {/* Indicador lateral de stock */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Hash className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{item.reference}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-primary-600 transition-colors">
            {item.name}
          </h3>
        </div>
        <div className="shrink-0 w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
          <Box className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Info labels */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{item.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{item.categoryName}</span>
        </div>
      </div>

      {/* Stock Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-2xl px-3 py-2.5">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Stock Actual</div>
          <div className={`text-lg font-black mt-1 ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
            {item.finalQuantity} <span className="text-xs font-normal text-slate-400">uds</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl px-3 py-2.5">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Precio Unit.</div>
          <div className="text-sm font-bold text-slate-800 mt-1.5">{formatPrice(item.price)}</div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium italic">
          Actualizado: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
        </span>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${stockColor}`}>
          {isLowStock ? 'Stock Bajo' : 'Disponible'}
        </div>
      </div>
    </button>
  );
}
