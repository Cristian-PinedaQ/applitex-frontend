import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, ProductRequest, Category, ProductAttributeRequest } from '../../../types/catalog';
import { catalogService } from '../../../services/catalog.service';

interface ProductFormModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ isOpen, product, categories, onClose, onSaved }: ProductFormModalProps) {
  const isEdit = !!product;

  const [form, setForm] = useState<ProductRequest>({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    quantity: 1,
  });

  const [attributes, setAttributes] = useState<{ key: string; value: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description || '',
        price: product.price,
        quantity: product.quantity,
      });
      setAttributes(
        product.attributes.map((a) => ({ key: a.attributeKey, value: a.defaultValue, id: a.id }))
      );
    } else {
      setForm({ categoryId: categories[0]?.id || '', name: '', description: '', price: 0, quantity: 1 });
      setAttributes([]);
    }
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProductRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { key: '', value: '0' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: val } : a)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;

    setLoading(true);
    try {
      let savedProduct: Product;

      if (isEdit && product) {
        savedProduct = await catalogService.updateProduct(product.id, form);

        // Sincronizar atributos: borrar los que ya no están, actualizar existentes, crear nuevos
        const existingIds = attributes.filter((a) => a.id).map((a) => a.id!);
        const toDelete = product.attributes.filter((a) => !existingIds.includes(a.id));
        for (const attr of toDelete) {
          await catalogService.deleteAttribute(attr.id);
        }
        for (const attr of attributes) {
          const payload: ProductAttributeRequest = { attributeKey: attr.key, defaultValue: attr.value };
          if (attr.id) {
            await catalogService.updateAttribute(attr.id, payload);
          } else if (attr.key.trim()) {
            await catalogService.createAttribute(savedProduct.id, payload);
          }
        }
      } else {
        savedProduct = await catalogService.createProduct(form);
        for (const attr of attributes) {
          if (attr.key.trim()) {
            await catalogService.createAttribute(savedProduct.id, {
              attributeKey: attr.key,
              defaultValue: attr.value,
            });
          }
        }
      }

      onSaved();
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Categoría */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Categoría *</label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none"
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              placeholder="Ej: Servicio de Mantenimiento"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              placeholder="Descripción opcional..."
            />
          </div>

          {/* Precio + Cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cantidad</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          {/* Atributos Dinámicos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atributos Dinámicos</label>
              <button
                type="button"
                onClick={addAttribute}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>

            {attributes.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-2xl">
                Sin atributos. Agrega propiedades personalizadas.
              </p>
            )}

            <div className="space-y-2">
              {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Llave (ej: Color)"
                    value={attr.key}
                    onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="w-9 h-9 shrink-0 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}
