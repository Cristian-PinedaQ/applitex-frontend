import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Tag, Plus, PackageOpen } from 'lucide-react';
import { ProductAttribute } from '../../../types/catalog';

interface AttributeListProps {
  attributes: ProductAttribute[];
  onEdit: (attr: ProductAttribute) => void;
  onDelete: (id: string) => void;
  onAdd: (productId: string) => void;
}

export function AttributeList({ attributes, onEdit, onDelete, onAdd }: AttributeListProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Agrupar por producto
  const grouped = attributes.reduce<Record<string, { productName: string; productId: string; items: ProductAttribute[] }>>(
    (acc, attr) => {
      if (!acc[attr.productId]) {
        acc[attr.productId] = { productName: attr.productName, productId: attr.productId, items: [] };
      }
      acc[attr.productId].items.push(attr);
      return acc;
    },
    {}
  );

  const groups = Object.values(grouped);

  const toggle = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Tag className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm text-slate-500 font-medium">No hay atributos registrados</p>
        <p className="text-xs text-slate-400 mt-1">Crea un producto y agrega atributos dinámicos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = expandedProducts.has(group.productId);
        return (
          <div key={group.productId} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            {/* Header colapsable */}
            <button
              type="button"
              onClick={() => toggle(group.productId)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                  <PackageOpen className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-800">{group.productName}</span>
                  <span className="text-xs text-slate-400 ml-2">({group.items.length} atributos)</span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Contenido expandido */}
            {isExpanded && (
              <div className="px-5 pb-4 space-y-2 border-t border-slate-100 pt-3">
                {group.items.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{attr.attributeKey}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-slate-900">{attr.defaultValue}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(attr)}
                        className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-primary-600" />
                      </button>
                      <button
                        onClick={() => onDelete(attr.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onAdd(group.productId)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar atributo
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
