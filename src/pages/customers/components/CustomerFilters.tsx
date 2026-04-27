import { Search } from 'lucide-react';

interface CustomerFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setStatusFilter: (val: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
}

export function CustomerFilters({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter 
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 p-2 rounded-3xl border border-slate-200/50 backdrop-blur-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o documento..."
          className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 font-medium"
        />
      </div>
      
      <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

      <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full md:w-auto">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold transition-all
              ${statusFilter === status 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>
    </div>
  );
}
