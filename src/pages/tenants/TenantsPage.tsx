import { useEffect, useState } from "react";
import { Tenant, TenantCreateRequest, tenantsService } from "../../services/tenants.service";
import { Building2, Plus, Search, Loader2, Edit3, Power, Zap } from "lucide-react";
import TenantFormModal from "./components/TenantFormModal";
import DeactivateTenantModal from "./components/DeactivateTenantModal";

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DELETED">("ACTIVE");
  const [isDesktop, setIsDesktop] = useState(true);

  const loadTenants = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await tenantsService.getAll(signal);
      setTenants(data);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadTenants(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleCreateOrUpdate = async (data: TenantCreateRequest & { status?: string }) => {
    if (selectedTenant) {
      await tenantsService.update(selectedTenant.id, { name: data.name, status: data.status, adminEmail: data.adminEmail });
    } else {
      await tenantsService.create(data);
    }
    loadTenants();
  };

  const handleDeactivate = async (id: string) => {
    await tenantsService.delete(id);
    loadTenants();
  };

  const handleActivate = async (id: string) => {
    await tenantsService.activate(id);
    loadTenants();
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: status === 'ACTIVE' ? '#00C2A820' : '#47556920', color: status === 'ACTIVE' ? '#00C2A8' : '#475569' }}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'ACTIVE' ? 'bg-[#00C2A8]' : 'bg-slate-400'}`}></span>
      {status === 'ACTIVE' ? 'ACTIVA' : 'INACTIVA'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7C5CFF] font-bold text-xs uppercase tracking-widest mb-2">
            <Building2 className="w-4 h-4" />
            <span>Ecosistema</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 text-sm mt-1">{tenants.length} empresas registradas</p>
        </div>

        <button
          onClick={() => { setSelectedTenant(null); setIsFormOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar organización..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C5CFF]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {(['ALL', 'ACTIVE', 'DELETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: statusFilter === s ? '#7C5CFF' : 'transparent', color: statusFilter === s ? '#ffffff' : '#475569' }}
            >
              {s === 'ALL' ? 'Todas' : s === 'ACTIVE' ? 'Activas' : 'Inactivas'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <Loader2 className="w-10 h-10 text-[#7C5CFF] animate-spin" />
            <p className="text-slate-500 font-medium mt-4">Cargando ecosistema...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <Building2 className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-medium mt-4">No se encontraron empresas</p>
          </div>
        ) : isDesktop ? (
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Identificador</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Organización</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Registro</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">/{tenant.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{tenant.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(tenant.createdAt))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedTenant(tenant); setIsFormOpen(true); }} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedTenant(tenant); setIsDeactivateOpen(true); }} disabled={tenant.id === 'master' || tenant.status === 'DELETED'} className={`p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-red-500 ${tenant.status === 'DELETED' ? 'hidden' : ''}`} title="Desactivar Empresa">
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleActivate(tenant.id)} className={`p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-emerald-500 ${tenant.status === 'ACTIVE' ? 'hidden' : ''}`} title="Reactivar Empresa">
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 space-y-4 bg-white">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="p-4 border border-slate-200 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">/{tenant.id}</span>
                    <p className="font-semibold text-slate-900 mt-2">{tenant.name}</p>
                    <p className="text-sm text-slate-500">{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(tenant.createdAt))}</p>
                  </div>
                  <StatusBadge status={tenant.status} />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setSelectedTenant(tenant); setIsFormOpen(true); }} className="flex-1 p-2 rounded-lg bg-slate-100 text-slate-600 text-sm">Editar</button>
                  <button onClick={() => { setSelectedTenant(tenant); setIsDeactivateOpen(true); }} disabled={tenant.id === 'master' || tenant.status === 'DELETED'} className={`flex-1 p-2 rounded-lg bg-slate-100 text-red-500 text-sm ${tenant.status === 'DELETED' ? 'hidden' : ''}`}>Desactivar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TenantFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedTenant(null); }}
        onSubmit={handleCreateOrUpdate}
        tenant={selectedTenant}
      />

      <DeactivateTenantModal
        isOpen={isDeactivateOpen}
        onClose={() => { setIsDeactivateOpen(false); setSelectedTenant(null); }}
        onConfirm={handleDeactivate}
        tenant={selectedTenant}
      />
    </div>
  );
};

export default TenantsPage;