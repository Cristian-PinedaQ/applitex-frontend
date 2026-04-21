import { useEffect, useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Customer, CustomerRequest } from '../../types/customer';
import { CustomerFilters } from './components/CustomerFilters';
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // ID del cliente a eliminar
  
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await customerService.delete(confirmDelete);
      setCustomers(customers.filter(c => c.id !== confirmDelete));
    } catch (error) {
      alert('Error al eliminar el cliente');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSave = async (data: CustomerRequest) => {
    try {
      if (selectedCustomer) {
        const updated = await customerService.update(selectedCustomer.id, data);
        setCustomers(customers.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await customerService.create(data);
        setCustomers([created, ...customers]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el cliente');
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
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{customers.filter(c => c.active).length} activos</span>
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

      {/* Modal de Creación / Edición */}
      <CustomerModal 
        isOpen={isModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

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
