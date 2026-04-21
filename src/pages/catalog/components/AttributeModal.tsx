import { useState, useEffect } from 'react';
import { X, PackageOpen } from 'lucide-react';
import { ProductAttribute, ProductAttributeRequest, Product } from '../../../types/catalog';

interface AttributeModalProps {
  isOpen: boolean;
  attribute: ProductAttribute | null; // null = crear
  productId: string | null; // pre-seleccionado (desde grupo) o null (desde botón global)
  products: Product[]; // lista de productos para el selector
  onClose: () => void;
  onSave: (productId: string, data: ProductAttributeRequest, attrId?: string) => void;
}

export function AttributeModal({ isOpen, attribute, productId, products, onClose, onSave }: AttributeModalProps) {
  const isEdit = !!attribute;

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [form, setForm] = useState<ProductAttributeRequest>({
    attributeKey: '',
    defaultValue: '0',
  });

  useEffect(() => {
    if (attribute) {
      setForm({ attributeKey: attribute.attributeKey, defaultValue: attribute.defaultValue });
      setSelectedProductId(attribute.productId);
    } else {
      setForm({ attributeKey: '', defaultValue: '0' });
      setSelectedProductId(productId || '');
    }
  }, [attribute, productId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.attributeKey.trim() || !selectedProductId) return;

    onSave(selectedProductId, form, attribute?.id);
    onClose();
  };

  // Si productId viene fijo (desde grupo), no mostrar selector
  const showProductSelector = !productId && !isEdit;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Editar Atributo' : 'Nuevo Atributo'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Selector de Producto (solo cuando se crea desde botón global) */}
          {showProductSelector && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Producto *</label>
              <div className="relative">
                <PackageOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.categoryName})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Nombre del producto (solo lectura en edición) */}
          {isEdit && attribute && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
              <PackageOpen className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-slate-700">{attribute.productName}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Llave *</label>
            <input
              type="text"
              value={form.attributeKey}
              onChange={(e) => setForm({ ...form, attributeKey: e.target.value })}
              required
              placeholder="Ej: Color, Tamaño, Material"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Valor por Defecto</label>
            <input
              type="text"
              value={form.defaultValue}
              onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedProductId}
            className="w-full py-3.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Actualizar Atributo' : 'Crear Atributo'}
          </button>
        </form>
      </div>
    </div>
  );
}
