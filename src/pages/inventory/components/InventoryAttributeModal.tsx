import { useState, useEffect } from 'react';
import { X, Save, Tag, Box } from 'lucide-react';
import { InventoryItemAttribute, InventoryItemAttributeRequest, InventoryItem } from '../../../types/inventory';

interface InventoryAttributeModalProps {
  attribute: InventoryItemAttribute | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InventoryItemAttributeRequest, itemId?: string) => Promise<void>;
  items: InventoryItem[];
}

export function InventoryAttributeModal({ attribute, isOpen, onClose, onSave, items }: InventoryAttributeModalProps) {
  const [formData, setFormData] = useState<InventoryItemAttributeRequest>({
    attributeKey: '',
    attributeValue: '',
  });
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (attribute) {
      setFormData({
        attributeKey: attribute.attributeKey,
        attributeValue: attribute.attributeValue,
      });
      setSelectedItemId(attribute.itemId);
    } else {
      setFormData({
        attributeKey: '',
        attributeValue: '',
      });
      setSelectedItemId('');
    }
  }, [attribute, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attribute && !selectedItemId) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData, selectedItemId);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {attribute ? 'Editar Atributo' : 'Nuevo Atributo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!attribute && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ítem de Inventario</label>
              <div className="relative">
                <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar ítem...</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.reference})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre (Llave)</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ej: Color, Talla, S/N..."
                value={formData.attributeKey}
                onChange={(e) => setFormData({ ...formData, attributeKey: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Valor</label>
            <input
              type="text"
              required
              placeholder="Ej: Rojo, Grande, 123456..."
              value={formData.attributeValue}
              onChange={(e) => setFormData({ ...formData, attributeValue: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Atributo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
