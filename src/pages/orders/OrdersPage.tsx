import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { 
  Plus, Search, RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { ordersService } from '../../services/orders.service';
import { customerService } from '../../services/customer.service';
import { CustomerSelectModal } from './components/CustomerSelectModal';
import { toast } from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: orders, isLoading } = useSWR(
    'orders',
    () => ordersService.getAll()
  );

  const { data: customers } = useSWR(
    isCustomerModalOpen ? 'customers' : null,
    () => customerService.getAll()
  );

  const handleCreateDraft = async (customerId: string) => {
    setIsCreatingDraft(true);
    try {
      const draft = await ordersService.initializeDraft(customerId);
      setIsCustomerModalOpen(false);
      navigate(`/orders/${draft.id}`);
    } catch (err) {
      toast.error('Error al iniciar el borrador de la orden');
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, completed: 0 };
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'CREATED' || o.status === 'IN_PROGRESS').length,
      completed: orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-[#7C5CFF] animate-spin" />
        <p className="text-slate-500 font-medium mt-4">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7C5CFF] font-bold text-xs uppercase tracking-widest mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Órdenes de Servicio</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes</h1>
          <p className="text-slate-500 text-sm mt-1">{orders?.length || 0} órdenes registradas</p>
        </div>

        <button onClick={() => setIsCustomerModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.pending}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pendientes</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.completed}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completadas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar orden o cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C5CFF]"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {(['ALL', 'CREATED', 'IN_PROGRESS', 'COMPLETED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: statusFilter === status ? '#7C5CFF' : 'transparent',
                color: statusFilter === status ? '#ffffff' : '#475569',
              }}
            >
              {status === 'ALL' ? 'Todos' : status === 'CREATED' ? 'Creadas' : status === 'IN_PROGRESS' ? 'En Proceso' : 'Completadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-semibold text-slate-700">No se encontraron órdenes</p>
            <p className="text-sm mt-2 text-slate-500">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Orden</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">#{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: order.status === 'COMPLETED' ? '#10b98120' : order.status === 'IN_PROGRESS' ? '#f59e0b20' : '#7C5CFF20',
                        color: order.status === 'COMPLETED' ? '#10b981' : order.status === 'IN_PROGRESS' ? '#f59e0b' : '#7C5CFF'
                      }}
                    >
                      {order.status === 'CREATED' ? 'CREADA' : order.status === 'IN_PROGRESS' ? 'EN PROCESO' : order.status === 'COMPLETED' ? 'COMPLETADA' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-[#7C5CFF] font-medium text-sm hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers || []}
        onSelect={handleCreateDraft}
        loading={isCreatingDraft}
      />
    </div>
  );
};

export default OrdersPage;