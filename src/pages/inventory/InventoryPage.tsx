import { useState, useEffect } from 'react';
import { Package, Hash, PlusCircle, LayoutGrid, ListTree, Loader2 } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { catalogService } from '../../services/catalog.service';
import { customerService } from '../../services/customer.service';
import { InventoryItem, InventoryItemRequest, InventoryItemAttribute, InventoryItemAttributeRequest } from '../../types/inventory';
import { Category } from '../../types/catalog';
import { Customer } from '../../types/customer';
import { InventoryCard } from './components/InventoryCard';
import { InventoryFilters } from './components/InventoryFilters';
import { InventoryDetailModal } from './components/InventoryDetailModal';
import { InventoryFormModal } from './components/InventoryFormModal';
import { QuantityAdjustModal } from './components/QuantityAdjustModal';
import { InventoryAttributeList } from './components/InventoryAttributeList';
import { InventoryAttributeModal } from './components/InventoryAttributeModal';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

type TabType = 'items' | 'attributes';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [attributes, setAttributes] = useState<InventoryItemAttribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');

  // Modals
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<InventoryItemAttribute | null>(null);

  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invData, attrData, catData, custData] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getAttributes(),
        catalogService.getCategories(),
        customerService.getAll(),
      ]);
      setItems(invData);
      setAttributes(attrData);
      setCategories(catData);
      setCustomers(custData);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers Ítems
  const handleCreateItem = async (data: InventoryItemRequest) => {
    await inventoryService.createInventoryItem(data);
    await fetchData();
  };

  const handleUpdateItem = async (data: InventoryItemRequest) => {
    if (!selectedItem) return;
    await inventoryService.updateInventoryItem(selectedItem.id, data);
    await fetchData();
  };

  const handleAdjustStock = async (amount: number) => {
    if (!selectedItem) return;
    await inventoryService.adjustQuantity(selectedItem.id, { amount });
    await fetchData();
    // Actualizar el item seleccionado para reflejar el cambio en el modal de detalle
    const updated = await inventoryService.getInventoryById(selectedItem.id);
    setSelectedItem(updated);
  };

  const handleDeleteItem = async (id: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar ítem de inventario?',
      message: 'Esta acción no se puede deshacer y eliminará también sus atributos asociados.',
      confirmText: 'Eliminar',
      type: 'danger',
    });

    if (confirmed) {
      await inventoryService.deleteInventoryItem(id);
      setIsDetailOpen(false);
      await fetchData();
    }
  };

  // Handlers Atributos
  const handleSaveAttribute = async (data: InventoryItemAttributeRequest, itemId?: string) => {
    if (selectedAttribute) {
      await inventoryService.updateAttribute(selectedAttribute.id, data);
    } else if (itemId) {
      await inventoryService.createAttribute(itemId, data);
    }
    await fetchData();
  };

  const handleDeleteAttribute = async (id: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar atributo?',
      message: '¿Estás seguro de eliminar esta especificación técnica?',
      confirmText: 'Eliminar',
      type: 'danger',
    });

    if (confirmed) {
      await inventoryService.deleteAttribute(id);
      await fetchData();
    }
  };

  // Filtrado
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchesCustomer = customerFilter === 'ALL' || item.customerId === customerFilter;
    return matchesSearch && matchesCategory && matchesCustomer;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse text-sm">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">Módulo Logístico</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Inventario</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg">Control de existencias multicliente, seguimiento por referencia y atributos dinámicos.</p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsFormOpen(true);
          }}
          className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary-100 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Ítem
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="bg-slate-100/50 p-1.5 rounded-[2rem] inline-flex gap-1">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${
            activeTab === 'items'
              ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Existencias
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${
            activeTab === 'attributes'
              ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ListTree className="w-4 h-4" />
          Atributos
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'items' ? (
          <>
            <InventoryFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              customerFilter={customerFilter}
              onCustomerChange={setCustomerFilter}
              categories={categories}
              customers={customers}
            />

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Hash className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 italic">No hay ítems registrados</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                  Comienza agregando un nuevo ítem de inventario para tus clientes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onClick={(i) => {
                      setSelectedItem(i);
                      setIsDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <InventoryAttributeList
            attributes={attributes}
            onEdit={(attr) => {
              setSelectedAttribute(attr);
              setIsAttrModalOpen(true);
            }}
            onDelete={handleDeleteAttribute}
            onAddNew={() => {
              setSelectedAttribute(null);
              setIsAttrModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <InventoryDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(i) => {
          setIsDetailOpen(false);
          setSelectedItem(i);
          setIsFormOpen(true);
        }}
        onAdjust={(i) => {
          setSelectedItem(i);
          setIsAdjustOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      <InventoryFormModal
        item={selectedItem}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={selectedItem ? handleUpdateItem : handleCreateItem}
        categories={categories}
        customers={customers}
        items={items}
      />

      <QuantityAdjustModal
        item={selectedItem}
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        onAdjust={handleAdjustStock}
      />

      <InventoryAttributeModal
        attribute={selectedAttribute}
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        onSave={handleSaveAttribute}
        items={items}
      />

      {confirm && <ConfirmDialogComponent />}
    </div>
  );
}
