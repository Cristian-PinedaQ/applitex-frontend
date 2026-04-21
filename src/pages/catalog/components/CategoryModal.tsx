import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, CategoryRequest } from '../../../types/catalog';

interface CategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: CategoryRequest, id?: string) => void;
}

export function CategoryModal({ isOpen, category, onClose, onSave }: CategoryModalProps) {
  const isEdit = !!category;

  const [form, setForm] = useState<CategoryRequest>({ name: '', description: '' });

  useEffect(() => {
    if (category) {
      setForm({ name: category.name, description: category.description || '' });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form, category?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej: Servicios, Repuestos"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Descripción opcional..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] mt-2"
          >
            {isEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </form>
      </div>
    </div>
  );
}
