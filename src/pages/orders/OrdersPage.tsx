import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, SlidersHorizontal, 
  Calendar as CalendarIcon, Loader2, RefreshCw,
  ShoppingBag, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { ordersService } from '../../services/orders.service';
import { ServiceOrder, OrderStatus } from '../../types/orders';
import OrdersTable from './components/OrdersTable';
import OrderFormModal from './components/OrderFormModal';
import OrderDetailModal from './components/OrderDetailModal';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | undefined>(undefined);
  const [viewOrder, setViewOrder] = useState<ServiceOrder | undefined>(undefined);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (err) {
      setError('No se pudieron cargar las órdenes de servicio.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreateNew = () => {
    setSelectedOrder(undefined);
    setIsModalOpen(true);
  };

  const handleView = (order: ServiceOrder) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      try {
        await ordersService.delete(id);
        loadOrders();
      } catch (err) {
        alert('Error al eliminar la orden.');
      }
    }
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      alert('Error al actualizar el estado.');
    }
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= dateTo;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'CREATED' || o.status === 'IN_PROGRESS').length,
      completed: orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length
    };
  }, [orders]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            Órdenes de Servicio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Gestiona y monitorea el flujo de producción.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
          <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendientes</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Persistence / Error State */}
      {error && (
        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 font-bold" />
          <p className="font-medium">{error}</p>
          <button onClick={loadOrders} className="ml-auto underline font-bold">Reintentar</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por # de orden o cliente..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-2xl transition-all outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
              {['ALL', 'CREATED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === status 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {status === 'ALL' ? 'Todos' : status}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold outline-none dark:text-white"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-slate-400">→</span>
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold outline-none dark:text-white"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-rose-500 hover:text-rose-600 ml-2">
                   <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[40px] p-2 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Sincronizando órdenes...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <OrdersTable 
            orders={filteredOrders} 
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-full mb-6 shadow-sm">
              <ShoppingBag className="w-16 h-16 opacity-20" />
            </div>
            <p className="text-xl font-bold">No se encontraron órdenes</p>
            <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadOrders}
        initialOrder={selectedOrder}
      />

      <OrderDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewOrder}
      />

    </div>
  );
};

export default OrdersPage;
