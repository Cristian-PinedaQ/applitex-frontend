import { useEffect, useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { Customer } from '../../types/customer';
import { CustomerFilters } from './components/CustomerFilters';
import { CustomerList } from './components/CustomerList';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { syncEngine } from '../../lib/syncCore';
import { SyncScope, CUSTOMER_FIELD_POLICY } from '../../types/sync';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const navigate = useNavigate();
  useScrollRestoration();
  
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const currentScope: SyncScope = (searchTerm || statusFilter !== 'ALL') ? 'customers:search' : 'customers:list';

  const loadCustomers = async (signal?: AbortSignal, isInitial = true) => {
    if (isInitial) setLoading(true);
    else setSyncing(true);

    const version = syncEngine.generateVersion(currentScope);

    try {
      const data = await customerService.getAll(signal);
      
      if (!syncEngine.isVersionValid(currentScope, version)) return;

      if (isInitial) {
        setCustomers(data);
      } else {
        setCustomers(prev => syncEngine.mergeCollections(prev, data, CUSTOMER_FIELD_POLICY));
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error('Error cargando clientes:', error);
    } finally {
      if (syncEngine.isVersionValid(currentScope, version)) {
        if (isInitial) setLoading(false);
        else setSyncing(false);
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
      const matchesSearch = 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document.includes(searchTerm);
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && c.active) || 
        (statusFilter === 'INACTIVE' && !c.active);
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleCreate = () => {
    navigate('/customers/new');
  };

  const handleEdit = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await customerService.delete(confirmDelete);
      // Tras eliminar, actualizamos el estado sin re-petición si es seguro,
      // o invocamos un refetch en background
      setCustomers(prev => prev.filter(c => c.id !== confirmDelete));
    } catch (error) {
      alert('Error al eliminar el cliente');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Estilo Apple */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Clientes</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>{customers.length} clientes en total</span>
              {syncing && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Sincronizando</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <CustomerFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Lista / Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <CustomerList 
          customers={filteredCustomers} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Eliminar Cliente"
        message="Esta acción no se puede deshacer. ¿Deseas eliminar permanentemente este cliente y toda su información?"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
