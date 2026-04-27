import { useEffect, useState } from "react";
import { Tenant, TenantCreateRequest, tenantsService } from "../../services/tenants.service";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Search, Loader2, Edit3, Power, Calendar, Zap } from "lucide-react";
import TenantFormModal from "./components/TenantFormModal";
import { SyncScope, TENANT_FIELD_POLICY } from '../../types/sync';
import { syncEngine } from '../../lib/syncCore';
import DeactivateTenantModal from "./components/DeactivateTenantModal";

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DELETED">("ACTIVE");
  
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const navigate = useNavigate();

  // Scope dinámico para peticiones
  const currentScope: SyncScope = searchTerm ? 'tenants:search' : 'tenants:list';

  const fetchTenants = async (signal?: AbortSignal, isInitial = true) => {
    if (isInitial) setLoading(true);
    else setSyncing(true);
    
    // Anclamos la petición al scope y obtenemos versión única
    const requestVersion = syncEngine.generateVersion(currentScope);

    try {
      const data = await tenantsService.getAll(signal);
      
      // Filtramos respuestas lentas o peticiones cruzadas
      if (!syncEngine.isVersionValid(currentScope, requestVersion)) return;

      if (isInitial) {
        setTenants(data);
      } else {
        setTenants(prev => syncEngine.mergeCollections(prev, data, TENANT_FIELD_POLICY));
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error(error);
    } finally {
      if (syncEngine.isVersionValid(currentScope, requestVersion)) {
        if (isInitial) setLoading(false);
        else setSyncing(false);
      }
    }
  };


  useEffect(() => {
    const controller = new AbortController();
    fetchTenants(controller.signal, true);
    
    return () => controller.abort();
  }, []);

  const handleCreateOrUpdate = async (data: TenantCreateRequest & { status?: string }) => {
    if (selectedTenant) {
      await tenantsService.update(selectedTenant.id, { 
        name: data.name, 
        status: data.status,
        adminEmail: data.adminEmail,
        password: data.password
      });
    } else {
      await tenantsService.create(data);
    }
    fetchTenants();
  };

  const handleDeactivate = async (id: string) => {
    await tenantsService.delete(id);
    fetchTenants();
  };

  const handleActivate = async (id: string) => {
    await tenantsService.activate(id);
    fetchTenants();
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
      status === 'ACTIVE' 
        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
        : 'bg-slate-100 text-slate-500 border border-slate-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
        status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
      }`}></span>
      {status === 'ACTIVE' ? 'ACTIVA' : 'INACTIVA'}
    </span>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Elite */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Ecosistema</h1>
              <div className="flex items-center gap-2 h-4">
                <p className="text-slate-500 font-medium text-sm">Control total de organizaciones multi-tenant.</p>
                {syncing && (
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sincronizando</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setSelectedTenant(null); setIsFormOpen(true); }}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[22px] font-black transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 dark:shadow-none translate-y-0 hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Nueva Empresa
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl">
              <Search className="w-4 h-4 text-indigo-600" />
            </div>
            <input
              type="text"
              placeholder="Buscar organización..."
              className="w-full pl-14 pr-4 py-3.5 md:py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white font-medium text-base h-[54px] md:h-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selector de Estado Elite */}
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[20px] border border-slate-200 dark:border-slate-800 w-full md:w-auto">
            {(['ALL', 'ACTIVE', 'DELETED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-[16px] text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
                  statusFilter === s
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xl shadow-indigo-100/20 dark:shadow-none border border-indigo-50 dark:border-slate-600'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {s === 'ALL' ? 'Todas' : s === 'ACTIVE' ? 'Activas' : 'Inactivas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido (Tabla o Cards) */}
      <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden min-h-dynamic">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando ecosistema...</p>
          </div>
        ) : isDesktop ? (
          /* Tabla Desktop */
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Organización</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <td className="px-10 py-8">
                    <span className="font-black text-sm bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-slate-700">
                      /{tenant.id}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-black text-slate-900 dark:text-white text-base">{tenant.name}</div>
                    <div className="text-xs text-slate-400 font-bold tracking-tight">Multi-tenant activo</div>
                  </td>
                  <td className="px-10 py-8">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(tenant.createdAt))}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => { setSelectedTenant(tenant); setIsFormOpen(true); }}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedTenant(tenant); setIsDeactivateOpen(true); }}
                        disabled={tenant.id === 'master' || tenant.status === 'DELETED'}
                        className={`p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-all ${tenant.status === 'DELETED' ? 'hidden' : ''}`}
                        title="Desactivar Empresa"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActivate(tenant.id)}
                        className={`p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-all ${tenant.status === 'ACTIVE' ? 'hidden' : ''}`}
                        title="Reactivar Empresa"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Cards Mobile */
          <div className="p-4 space-y-4">
            {filteredTenants.map((tenant) => (
              <div 
                key={tenant.id} 
                onClick={() => navigate(`/tenants/${tenant.id}`)}
                className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white leading-tight">{tenant.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">ID: {tenant.id}</p>
                      </div>
                   </div>
                   <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant); setIsFormOpen(true); }}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 shadow-sm"
                   >
                      <Edit3 className="w-4 h-4" />
                   </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                   <StatusBadge status={tenant.status} />
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' }).format(new Date(tenant.createdAt))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TenantFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        tenant={selectedTenant}
      />

      <DeactivateTenantModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        tenant={selectedTenant}
      />
    </div>
  );
};

export default TenantsPage;
