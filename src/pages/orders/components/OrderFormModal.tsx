import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Plus, Trash2, Save, ShoppingBag, 
  User, Layers, Package, ClipboardList, 
  Hash, DollarSign, Calculator, AlertCircle 
} from 'lucide-react';
import { customerService } from '../../../services/customer.service';
import { catalogService } from '../../../services/catalog.service';
import { inventoryService } from '../../../services/inventory.service';
import { ordersService } from '../../../services/orders.service';
import { Customer } from '../../../types/customer';
import { Category, Product } from '../../../types/catalog';
import { InventoryItem } from '../../../types/inventory';
import { ServiceOrderDetailRequest, ServiceOrder } from '../../../types/orders';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialOrder?: ServiceOrder;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ 
  isOpen, onClose, onSuccess, initialOrder 
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  // State for products per category to avoid redundant calls
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});

  const [formData, setFormData] = useState({
    customerId: '',
    details: [] as ServiceOrderDetailRequest[]
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialOrder) {
        // Implementación de edición si es necesario en el futuro
        setFormData({
          customerId: initialOrder.customerId,
          details: initialOrder.details.map(d => ({
            categoryId: d.categoryId,
            productId: d.productId,
            inventoryItemId: d.inventoryItemId,
            usedInventoryQuantity: d.usedInventoryQuantity,
            price: d.price,
            quantity: d.quantity,
            attributes: d.attributes.map(a => ({
              attributeKey: a.attributeKey,
              attributeValue: a.attributeValue
            }))
          }))
        });
      } else {
        setFormData({ customerId: '', details: [] });
      }
    }
  }, [isOpen, initialOrder]);

  const loadInitialData = async () => {
    try {
      const [customersData, categoriesData] = await Promise.all([
        customerService.getAll(),
        catalogService.getCategories()
      ]);
      setCustomers(customersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data', error);
    }
  };

  const loadInventoryByCustomer = async (customerId: string) => {
    try {
      const items = await inventoryService.getInventoryByCustomer(customerId);
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory', error);
    }
  };

  const loadProductsForCategory = async (categoryId: string) => {
    if (productsByCategory[categoryId]) return;
    try {
      const products = await catalogService.getProductsByCategory(categoryId);
      setProductsByCategory(prev => ({ ...prev, [categoryId]: products }));
    } catch (error) {
      console.error('Error loading products', error);
    }
  };

  const handleAddDetail = () => {
    const newDetail: ServiceOrderDetailRequest = {
      categoryId: '',
      productId: '',
      price: 0,
      quantity: 1,
      attributes: []
    };
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, newDetail]
    }));
  };

  const handleRemoveDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleDetailChange = async (index: number, field: keyof ServiceOrderDetailRequest, value: any) => {
    const updatedDetails = [...formData.details];
    const detail = { ...updatedDetails[index] };

    // @ts-ignore
    detail[field] = value;

    if (field === 'categoryId') {
      detail.productId = '';
      detail.price = 0;
      detail.attributes = [];
      if (value) loadProductsForCategory(value);
    }

    if (field === 'productId') {
      if (value) {
        const product = productsByCategory[detail.categoryId]?.find(p => p.id === value);
        if (product) {
          detail.price = product.price;
          // Pre-cargar atributos del catálogo
          detail.attributes = product.attributes.map(attr => ({
            attributeKey: attr.attributeKey,
            attributeValue: attr.defaultValue || ''
          }));
        }
      } else {
        detail.price = 0;
        detail.attributes = [];
      }
    }

    updatedDetails[index] = detail;
    setFormData(prev => ({ ...prev, details: updatedDetails }));
  };

  const handleAttributeChange = (detailIndex: number, attrIndex: number, value: string) => {
    const updatedDetails = [...formData.details];
    updatedDetails[detailIndex].attributes[attrIndex].attributeValue = value;
    setFormData(prev => ({ ...prev, details: updatedDetails }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.details.length === 0) return;
    
    setLoading(true);
    try {
      await ordersService.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating order', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrder = useMemo(() => {
    return formData.details.reduce((acc, current) => acc + (current.price * current.quantity), 0);
  }, [formData.details]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              {initialOrder ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Completa la información para procesar la orden de trabajo.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Cliente
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                value={formData.customerId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, customerId: e.target.value }));
                  loadInventoryByCustomer(e.target.value);
                }}
              >
                <option value="">Selecciona un cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.document}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" /> Ítems de la Orden
              </h3>
              <button
                type="button"
                onClick={handleAddDetail}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Añadir Producto
              </button>
            </div>

            {formData.details.length === 0 && (
              <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                  <Package className="w-10 h-10" />
                </div>
                <p>No has añadido productos a esta orden todavía.</p>
              </div>
            )}

            {formData.details.map((detail, index) => (
              <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Categoría</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      value={detail.categoryId}
                      onChange={(e) => handleDetailChange(index, 'categoryId', e.target.value)}
                    >
                      <option value="">Categoría...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Product */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Producto</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      value={detail.productId}
                      onChange={(e) => handleDetailChange(index, 'productId', e.target.value)}
                      disabled={!detail.categoryId}
                    >
                      <option value="">Producto...</option>
                      {productsByCategory[detail.categoryId]?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Precio Unit.</label>
                    <div className="relative">
                      < DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 text-xs" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        value={detail.price}
                        onChange={(e) => handleDetailChange(index, 'price', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Cantidad</label>
                    <div className="relative">
                      <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        value={detail.quantity}
                        onChange={(e) => handleDetailChange(index, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {/* Inventory Link (Optional) */}
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                    <label className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3 block flex items-center gap-2">
                       <Layers className="w-4 h-4" /> Descontar de Inventario (Opcional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 rounded-xl text-sm"
                        value={detail.inventoryItemId || ''}
                        disabled={!formData.customerId}
                        onChange={(e) => handleDetailChange(index, 'inventoryItemId', e.target.value || undefined)}
                      >
                        <option value="">No descontar...</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.finalQuantity} disp.)</option>
                        ))}
                      </select>
                      {detail.inventoryItemId && (
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Cant. a usar"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 rounded-xl text-sm"
                            value={detail.usedInventoryQuantity || ''}
                            onChange={(e) => handleDetailChange(index, 'usedInventoryQuantity', parseFloat(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                    {!formData.customerId && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1 leading-tight">
                        <AlertCircle className="w-3 h-3" /> Selecciona un cliente para ver su inventario personal.
                      </p>
                    )}
                  </div>

                  {/* Attributes / Ficha Técnica */}
                  <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                    <label className="text-sm font-bold text-indigo-800 dark:text-indigo-400 mb-3 block flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> Ficha Técnica / Atributos
                    </label>
                    {detail.attributes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {detail.attributes.map((attr, attrIndex) => (
                          <div key={attrIndex}>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block pl-1">{attr.attributeKey}</label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-sm"
                              value={attr.attributeValue}
                              onChange={(e) => handleAttributeChange(index, attrIndex, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay atributos para este producto.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-slate-900 dark:bg-indigo-600 rounded-2xl flex items-center gap-3 shadow-lg">
              <span className="text-slate-400 dark:text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Orden</span>
              <span className="text-2xl font-black text-white">$ {totalOrder.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.customerId || formData.details.length === 0}
              className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 translate-y-0 hover:-translate-y-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {initialOrder ? 'Guardar Cambios' : 'Crear Orden'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
