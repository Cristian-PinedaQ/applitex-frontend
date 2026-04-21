import { Search, Filter, User } from 'lucide-react';
import { Category } from '../../../types/catalog';
import { Customer } from '../../../types/customer';

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  customerFilter: string;
  onCustomerChange: (value: string) => void;
  categories: Category[];
  customers: Customer[];
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  customerFilter,
  onCustomerChange,
  categories,
  customers,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o referencia..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filtro Cliente */}
        <div className="relative flex-1 sm:flex-initial">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={customerFilter}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full sm:w-48 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all cursor-pointer"
          >
            <option value="ALL">Todos los clientes</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>

        {/* Filtro Categoría */}
        <div className="relative flex-1 sm:flex-initial">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-48 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all cursor-pointer"
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
