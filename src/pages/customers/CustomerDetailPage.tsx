import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Mail, 
  Loader2, 
  Save, 
  Trash2,
  Phone,
  MapPin,
  Building,
  User as UserIcon,
  CreditCard,
  Building2,
  Calendar,
  Box,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer, CustomerRequest, DocumentType } from '../../types/customer';
import { InventoryItem } from '../../types/inventory';
import { customerService } from '../../services/customer.service';
import { inventoryService } from '../../services/inventory.service';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerInventory, setCustomerInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  const isKeyboardVisible = useKeyboardVisible();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Estado local para edición "Inline" e inserción
  const [editData, setEditData] = useState<CustomerRequest>({
    fullName: '',
    document: '',
    documentType: 'CC',
    customerType: 'PERSONA_NATURAL',
    email: '',
    phone: '',
    city: '',
    address: '',
    businessName: '',
    active: true
  });

  const loadCustomer = async (signal?: AbortSignal) => {
    if (isNew) return;
    
    setLoading(true);
    try {
      const data = await customerService.getById(id!, signal);
      setCustomer(data);
      setEditData({
        fullName: data.fullName,
        document: data.document,
        documentType: data.documentType,
        customerType: data.customerType,
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        address: data.address || '',
        businessName: data.businessName || '',
        active: data.active
      });
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError('No se pudo cargar la información del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    if (isNew || !id) return;
    setLoadingInventory(true);
    try {
      const data = await inventoryService.getByCustomer(id);
      setCustomerInventory(data);
    } catch (err) {
      console.error('Error loading customer inventory', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCustomer(controller.signal);
    loadInventory();
    return () => controller.abort();
  }, [id]);

  const handleSave = async () => {
    if (!editData.fullName || !editData.document) {
       alert("Nombre y documento son obligatorios.");
       return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await customerService.create(editData);
        navigate('/customers', { replace: true });
      } else {
        await customerService.update(id!, editData);
        await loadCustomer();
      }
    } catch (err) {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente permanentemente?')) return;
    try {
      await customerService.delete(id);
      navigate('/customers', { replace: true });
    } catch (err) {
      setError('Error al eliminar el cliente');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando expediente...</p>
      </div>
    );
  }

  if (error || (!customer && !isNew)) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[40px] border border-rose-100">
        <p className="text-rose-600 font-bold">{error || 'Cliente no encontrado'}</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-primary-600 font-bold underline">Volver al catálogo de clientes</button>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-32 md:pb-10"
      >
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/customers')}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                {isNew ? 'Nuevo Cliente' : editData.fullName || 'Sin nombre'}
              </h1>
              <p className="text-sm font-medium text-slate-400">
                {isNew ? 'Registro de cliente/empresa' : `Expediente Comercial / ID: ${customer?.id.substring(0, 8)}`}
              </p>
            </div>
          </div>

          {/* Acciones solo en Desktop en el header */}
          <div className="hidden md:flex items-center gap-3">
             {!isNew && (
               <button 
                onClick={handleDelete}
                className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                title="Eliminar Cliente"
               >
                  <Trash2 className="w-5 h-5" />
               </button>
             )}
             <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Cliente
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal (2/3 en Desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sec: Identidad */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600">
                     <UserIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Identidad Domiciliaria</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo Cliente */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clasificación Jurídica</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary-500">
                       <button
                         type="button"
                         onClick={() => setEditData({ ...editData, customerType: 'PERSONA_NATURAL' })}
                         className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${editData.customerType === 'PERSONA_NATURAL' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          <UserIcon className="w-4 h-4" /> Natural
                       </button>
                       <button
                         type="button"
                         onClick={() => setEditData({ ...editData, customerType: 'EMPRESA' })}
                         className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${editData.customerType === 'EMPRESA' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          <Building className="w-4 h-4" /> Empresa
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo / Razón Social *</label>
                     <input 
                      type="text" 
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                     />
                  </div>
                  
                  {editData.customerType === 'EMPRESA' && (
                     <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Comercial (Opcional)</label>
                       <input 
                        type="text" 
                        value={editData.businessName}
                        onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                        placeholder="Ej. Distribuciones JP"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                       />
                    </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Documento</label>
                     <select 
                       value={editData.documentType}
                       onChange={(e) => setEditData({ ...editData, documentType: e.target.value as DocumentType })}
                       className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white appearance-none cursor-pointer"
                     >
                       <option value="CC">Cédula de Ciudadanía (CC)</option>
                       <option value="CE">Cédula de Extranjería (CE)</option>
                       <option value="NIT">NIT</option>
                       <option value="PASSPORT">Pasaporte</option>
                       <option value="OTHER">Otro</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Número de Documento *</label>
                     <input 
                      type="text" 
                      value={editData.document}
                      onChange={(e) => setEditData({ ...editData, document: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                     />
                  </div>
               </div>
            </div>

            {/* Sec: Contacto */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                     <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Información de Contacto</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico</label>
                     <div className="relative">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input 
                        type="email" 
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        placeholder="usuario@correo.com"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                       />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teléfono Móvil</label>
                     <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input 
                        type="tel" 
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="+57 300..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                       />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ciudad Residencia</label>
                     <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input 
                        type="text" 
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="Bogotá, Medellín..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                       />
                     </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dirección Física</label>
                     <input 
                      type="text" 
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      placeholder="Calle 123 # 45-67..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-700 dark:text-white"
                     />
                  </div>
               </div>
            </div>

            {/* Sec: Inventario en Custodia (NUEVO) */}
            {!isNew && (
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                         <Box className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">Inventario en Custodia</h3>
                    </div>
                    <button 
                      onClick={() => navigate(`/inventory/new?customerId=${id}`)}
                      className="text-xs font-black text-primary-600 hover:underline uppercase tracking-widest"
                    >
                      + Nuevo Ítem
                    </button>
                 </div>

                 {loadingInventory ? (
                   <div className="py-12 flex justify-center">
                      <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                   </div>
                 ) : customerInventory.length === 0 ? (
                   <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <p className="text-slate-400 font-bold">Este cliente no tiene stock registrado actualmente.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerInventory.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => navigate(`/inventory/${item.id}`)}
                          className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30 transition-all cursor-pointer group"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.categoryName}</span>
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                                 <div className={`w-1.5 h-1.5 rounded-full ${item.availableQuantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                 <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                   {item.availableQuantity > 0 ? 'Con Stock' : 'Agotado'}
                                 </span>
                              </div>
                           </div>
                           <h4 className="font-black text-slate-900 dark:text-white mb-4 line-clamp-1">{item.name}</h4>
                           <div className="flex items-end justify-between">
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Disponible</p>
                                 <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{item.availableQuantity} <span className="text-xs opacity-40">uds.</span></p>
                              </div>
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                 <ArrowRight size={16} className="text-primary-600" />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Sidebar de Estados (1/3 en Desktop) */}
          <div className="space-y-8">
             
             {/* Card: Status Operativo */}
             <div className={`${editData.active ? 'bg-primary-600' : 'bg-slate-600'} rounded-[40px] p-8 text-white shadow-2xl transition-colors overflow-hidden relative`}>
                <div className="absolute -right-10 -top-10 opacity-10">
                   <Building2 size={200} />
                </div>
                <div className="relative z-10 space-y-6">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Estado del Cliente</p>
                      <button 
                         onClick={() => setEditData({ ...editData, active: !editData.active })}
                         className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all"
                      >
                         <div className={`w-2.5 h-2.5 rounded-full ${editData.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
                         <span className="font-black tracking-tighter text-lg text-white">
                           {editData.active ? 'Activo (Ruta Habilitada)' : 'Suspendido / Inactivo'}
                         </span>
                      </button>
                   </div>
                   {!isNew && customer && (
                     <div className="flex items-center gap-4 py-6 border-t border-white/10">
                        <div className="flex-1">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cliente desde</p>
                           <p className="font-bold text-lg leading-tight">
                             {new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(new Date(customer.registrationDay))}
                           </p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                           <Calendar className="w-6 h-6" />
                        </div>
                     </div>
                   )}
                </div>
             </div>
             
             {/* Info de Negocio (Placeholder for future CRM features) */}
             {!isNew && (
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">Métricas</h4>
                      <CreditCard className="w-5 h-5 text-slate-400" />
                   </div>
                   <div className="space-y-4 text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <p className="font-bold text-slate-400">Las métricas de compras estarán disponibles aquí pronto.</p>
                   </div>
                </div>
             )}

          </div>

        </div>
      </motion.div>

      {/* Sticky Bottom Bar for Mobile Actions */}
      <AnimatePresence>
        {!isDesktop && !isKeyboardVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 pb-safe glass-dark dark:glass-dark border-t border-white/10 z-50 flex gap-3"
          >
             {!isNew && (
               <button 
                  onClick={handleDelete}
                  className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
               >
                  <Trash2 className="w-6 h-6" />
               </button>
             )}
             <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
             >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Cliente
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerDetailPage;
