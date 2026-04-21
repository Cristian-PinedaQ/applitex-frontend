import { Pencil, Trash2, FolderOpen, PackageOpen } from 'lucide-react';
import { Category } from '../../../types/catalog';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm text-slate-500 font-medium">No hay categorías</p>
        <p className="text-xs text-slate-400 mt-1">Crea tu primera categoría para organizar productos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h3>
              {cat.description && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{cat.description}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <PackageOpen className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-400">
                  {cat.products?.length || 0} productos
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(cat)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-400 hover:text-primary-600" />
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
