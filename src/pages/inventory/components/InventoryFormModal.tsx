import { useState, useEffect } from 'react';
import { X, Save, Tag, User, Package, DollarSign, Box, Copy, Plus, Trash2, ListTree } from 'lucide-react';
import { InventoryItem, InventoryItemRequest, InventoryItemAttributeRequest } from '../../../types/inventory';
import { Category } from '../../../types/catalog';
import { Customer } from '../../../types/customer';

interface InventoryFormModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InventoryItemRequest) => Promise<void>;
  categories: Category[];
  customers: Customer[];
  items: InventoryItem[];
}

export function InventoryFormModal({ item, isOpen, onClose, onSave, categories, customers, items }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<InventoryItemRequest>({
    categoryId: '',
    customerId: '',
    name: '',
    detail: '',
    price: 0,
    initialQuantity: 0,
    attributes: []
  });
  
  const [dynamicAttributes, setDynamicAttributes] = useState<InventoryItemAttributeRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        categoryId: item.categoryId,
        customerId: item.customerId,
        name: item.name,
        detail: item.detail || '',
        price: item.price,
        initialQuantity: item.initialQuantity,
        attributes: []
      });
      setDynamicAttributes([]);
    } else {
      setFormData({
        categoryId: '',
        customerId: '',
        name: '',
        detail: '',
        price: 0,
        initialQuantity: 0,
        attributes: []
      });
      setDynamicAttributes([]);
      setSelectedTemplateId('');
    }
  }, [item, isOpen]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const template = items.find(i => i.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        categoryId: template.categoryId,
        price: template.price,
        detail: template.detail || '',
      }));

      const clonedAttrs = (template.attributes || []).map(a => ({
        attributeKey: a.attributeKey,
        attributeValue: a.attributeValue
      }));
      setDynamicAttributes(clonedAttrs);
    }
  };

  const addAttribute = () => {
    setDynamicAttributes([...dynamicAttributes, { attributeKey: '', attributeValue: '' }]);
  };

  const removeAttribute = (index: number) => {
    setDynamicAttributes(dynamicAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof InventoryItemAttributeRequest, value: string) => {
    const updated = [...dynamicAttributes];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validAttributes = dynamicAttributes.filter(a => a.attributeKey.trim() !== '');
      await onSave({ ...formData, attributes: validAttributes });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{item ? 'Editar Ítem' : 'Nuevo Ítem de Inventario'}</h2>
            {!item && <p className="text-xs text-slate-500 mt-0.5">Define los detalles técnicos y generales del producto.</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form id="inventory-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {!item && (
            <div className="bg-primary-50/50 p-5 rounded-3xl border border-primary-100 space-y-3">
              <div className="flex items-center gap-2 text-primary-700">
                <Copy className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Cargar desde Plantilla</span>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
              >
                <option value="">Seleccionar un ítem existente como base...</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.reference} - {i.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Información General</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Categoría</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre del Ítem</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Rollo Tela Algodón Premium"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Precio Unitario</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cantidad Inicial</label>
                <div className="relative">
                  <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={!!item}
                    value={formData.initialQuantity}
                    onChange={(e) => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {!item && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mb-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <ListTree className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Especificaciones Técnicas</span>
                </div>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Añadir Atributo
                </button>
              </div>

              {dynamicAttributes.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">No hay atributos definidos. Usa una plantilla o añade uno manualmente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dynamicAttributes.map((attr, index) => (
                    <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Propiedad (Ej: Color)"
                          value={attr.attributeKey}
                          onChange={(e) => updateAttribute(index, 'attributeKey', e.target.value)}
                          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Valor (Ej: Azul)"
                          value={attr.attributeValue}
                          onChange={(e) => updateAttribute(index, 'attributeValue', e.target.value)}
                          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 border-t border-slate-100 pt-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notas Adicionales</label>
            <textarea
              rows={3}
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              placeholder="Cualquier información relevante..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            form="inventory-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {item ? 'Actualizar Registro' : 'Confirmar y Guardar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
