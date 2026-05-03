import { PackageOpen, Tag } from 'lucide-react';
import { Product } from '../../../types/catalog';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-5 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-xs font-medium text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-full inline-block mt-1">
            {product.categoryName}
          </span>
        </div>
        <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
          <PackageOpen className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Descripción */}
      {product.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-center">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Precio</div>
          <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{formatPrice(product.price)}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-center">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Cant.</div>
          <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{product.quantity}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl px-3 py-2 text-center">
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium uppercase tracking-wider">Total</div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{formatPrice(product.totalValue)}</div>
        </div>
      </div>

      {/* Atributos */}
      {product.attributes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.attributes.slice(0, 4).map((attr) => (
            <span
              key={attr.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
            >
              <Tag className="w-3 h-3" />
              {attr.attributeKey}: {attr.defaultValue}
            </span>
          ))}
          {product.attributes.length > 4 && (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-2 py-1">
              +{product.attributes.length - 4} más
            </span>
          )}
        </div>
      )}
    </button>
  );
}
