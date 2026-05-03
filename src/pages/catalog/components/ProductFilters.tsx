import { Search, Filter } from 'lucide-react';
import { Category } from '../../../types/catalog';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
        />
      </div>

      {/* Filtro Categoría */}
      <div className="relative">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full sm:w-52 pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all cursor-pointer"
        >
          <option value="ALL">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
