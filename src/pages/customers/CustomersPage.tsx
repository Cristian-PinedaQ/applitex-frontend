import { useEffect, useState, useMemo } from 'react';
import { Plus, Users, Search, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { Customer } from '../../types/customer';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { syncEngine } from '../../lib/syncCore';
import { SyncScope, CUSTOMER_FIELD_POLICY } from '../../types/sync';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const navigate = useNavigate();
  useScrollRestoration();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const currentScope: SyncScope = (searchTerm || statusFilter !== 'ALL') ? 'customers:search' : 'customers:list';

  const loadCustomers = async (signal?: AbortSignal, isInitial = true) => {
    if (isInitial) setLoading(true);
    const version = syncEngine.generateVersion(currentScope);

    try {
      const data = await customerService.getAll(signal);
      if (!syncEngine.isVersionValid(currentScope, version)) return;
      if (isInitial) setCustomers(data);
      else setCustomers(prev => syncEngine.mergeCollections(prev, data, CUSTOMER_FIELD_POLICY));
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error('Error cargando clientes:', error);
    } finally {
      if (syncEngine.isVersionValid(currentScope, version)) {
        if (isInitial) setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCustomers(controller.signal, true);
    return () => controller.abort();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.document.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && c.active) || (statusFilter === 'INACTIVE' && !c.active);
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const activeCustomers = customers.filter(c => c.active).length;
  const inactiveCustomers = customers.length - activeCustomers;

  const handleCreate = () => navigate('/customers/new');
  const handleEdit = (customer: Customer) => navigate(`/customers/${customer.id}`);
  const handleDelete = (id: string) => setConfirmDelete(id);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await customerService.delete(confirmDelete);
      setCustomers(prev => prev.filter(c => c.id !== confirmDelete));
    } catch { alert('Error al eliminar'); }
    finally { setConfirmDelete(null); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-[#7C5CFF] border-t-transparent animate-spin" />
        <p className="mt-4 text-slate-600 font-medium">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7C5CFF] font-bold text-xs uppercase tracking-widest mb-2">
            <Users className="w-4 h-4" />
            <span>Gestión de Clientes</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{customers.length} clientes registrados</p>
        </div>

        <button
          onClick={handleCreate}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#00C2A8' }}>{activeCustomers}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Activos</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#475569' }}>{inactiveCustomers}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inactivos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C5CFF]"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: statusFilter === status ? '#7C5CFF' : 'transparent',
                color: statusFilter === status ? '#ffffff' : '#475569',
              }}
            >
              {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No se encontraron clientes</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#7C5CFF' }}>
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">{customer.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{customer.documentType}</span>
                    <span className="ml-2 text-slate-600">{customer.document}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: customer.active ? '#00C2A820' : '#47556920',
                        color: customer.active ? '#00C2A8' : '#475569'
                      }}
                    >
                      {customer.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(customer)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(customer.id)} className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Eliminar Cliente"
        message="¿Eliminar este cliente permanentemente?"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}