import { useEffect, useState, useMemo } from 'react';
import { Plus, PackageOpen, Tag, FolderOpen, Search, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '../../services/catalog.service';
import { Product, Category, ProductAttribute, ProductAttributeRequest, CategoryRequest } from '../../types/catalog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AttributeList } from './components/AttributeList';
import { AttributeModal } from './components/AttributeModal';
import { CategoryList } from './components/CategoryList';
import { CategoryModal } from './components/CategoryModal';
import { syncEngine } from '../../lib/syncCore';
import { SyncScope, CATALOG_FIELD_POLICY } from '../../types/sync';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';

type Tab = 'products' | 'attributes' | 'categories';

export function CatalogPage() {
  useScrollRestoration();

  const navigate = useNavigate();

  // ─── Estado de datos ───
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // ─── Tabs ───
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // ─── Búsqueda y filtros ───
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // ─── Modales de atributos y categorías ───
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editAttribute, setEditAttribute] = useState<ProductAttribute | null>(null);
  const [attrProductId, setAttrProductId] = useState<string | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // ─── Confirmación de eliminación ───
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'attribute' | 'category'; id: string } | null>(null);

  // ─── Fetch con AbortController y SyncCore ───
  const loadAll = async (signal?: AbortSignal) => {
    const scope: SyncScope = 'catalog:list';
    const version = syncEngine.generateVersion(scope);

    try {
      const [p, c, a] = await Promise.all([
        catalogService.getProducts(signal),
        catalogService.getCategories(signal),
        catalogService.getAttributes(signal),
      ]);

      if (!syncEngine.isVersionValid(scope, version)) return;

      setProducts(prev => syncEngine.mergeCollections(prev, p, CATALOG_FIELD_POLICY));
      setCategories(c);
      setAttributes(a);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadAll(controller.signal);
    return () => controller.abort();
  }, []);

  // Revalidación en background (SWR)
  const handleRevalidate = () => {
    const controller = new AbortController();
    setSyncing(true);
    loadAll(controller.signal);
    return () => controller.abort();
  };

  // ─── Filtrado de productos ───
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  // ─── Atributos: acciones ───
  const handleEditAttr = (attr: ProductAttribute) => {
    setEditAttribute(attr);
    setAttrProductId(null);
    setIsAttrModalOpen(true);
  };

  const handleAddAttr = (productId: string) => {
    setEditAttribute(null);
    setAttrProductId(productId);
    setIsAttrModalOpen(true);
  };

  const handleSaveAttr = async (productId: string, data: ProductAttributeRequest, attrId?: string) => {
    try {
      if (attrId) {
        await catalogService.updateAttribute(attrId, data);
      } else {
        await catalogService.createAttribute(productId, data);
      }
      handleRevalidate();
    } catch {
      alert('Error al guardar el atributo');
    }
  };

  // ─── Categorías: acciones ───
  const handleSaveCategory = async (data: CategoryRequest, id?: string) => {
    try {
      if (id) {
        await catalogService.updateCategory(id, data);
      } else {
        await catalogService.createCategory(data);
      }
      handleRevalidate();
    } catch {
      alert('Error al guardar la categoría');
    }
  };

  // ─── Eliminación confirmada ───
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'product') {
        await catalogService.deleteProduct(confirmDelete.id);
      } else if (confirmDelete.type === 'attribute') {
        await catalogService.deleteAttribute(confirmDelete.id);
      } else {
        await catalogService.deleteCategory(confirmDelete.id);
      }
      handleRevalidate();
    } catch {
      alert('Error al eliminar');
    } finally {
      setConfirmDelete(null);
    }
  };

  const deleteMessages: Record<string, { title: string; message: string }> = {
    product: { title: 'Eliminar Producto', message: 'Se eliminará este producto y sus atributos asociados. Esta acción no se puede deshacer.' },
    attribute: { title: 'Eliminar Atributo', message: '¿Deseas eliminar este atributo permanentemente?' },
    category: { title: 'Eliminar Categoría', message: 'Se eliminarán todos los productos de esta categoría. Esta acción no se puede deshacer.' },
  };

  // ─── Tabs config ───
  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'products', label: 'Productos', icon: PackageOpen, count: products.length },
    { key: 'attributes', label: 'Atributos', icon: Tag, count: attributes.length },
    { key: 'categories', label: 'Categorías', icon: FolderOpen, count: categories.length },
  ];

  // ─── Acción del botón principal según tab ───
  const handlePrimaryAction = () => {
    if (activeTab === 'products') {
      navigate('/catalog/new');
    } else if (activeTab === 'attributes') {
      setEditAttribute(null);
      setAttrProductId(null);
      setIsAttrModalOpen(true);
    } else {
      setEditCategory(null);
      setIsCatModalOpen(true);
    }
  };

  const primaryLabel =
    activeTab === 'products' ? 'Nuevo Producto' :
    activeTab === 'attributes' ? 'Nuevo Atributo' :
    'Nueva Categoría';

  // ─── Pantalla de carga ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Catálogo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {products.length} producto{products.length !== 1 ? 's' : ''} · {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRevalidate}
            disabled={syncing}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40"
            title="Revalidar datos"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <button
            onClick={handlePrimaryAction}
            className="flex items-center gap-2 px-5 py-3 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {primaryLabel}
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
              activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── TAB: Productos ─── */}
      {activeTab === 'products' && (
        <div className="space-y-5">

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-slate-700 dark:text-white"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 dark:text-white cursor-pointer"
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Lista de productos (Drill-Down) */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 mx-auto bg-indigo-50 dark:bg-indigo-950 rounded-[28px] flex items-center justify-center mb-6">
                <PackageOpen className="w-10 h-10 text-indigo-300" />
              </div>
              <p className="text-lg font-black text-slate-700 dark:text-white">No hay productos</p>
              <p className="text-sm text-slate-400 mt-2 mb-6">
                {searchTerm || categoryFilter !== 'ALL' ? 'No hay resultados para tu búsqueda' : 'Agrega tu primer producto al catálogo'}
              </p>
              {!searchTerm && categoryFilter === 'ALL' && (
                <button
                  onClick={() => navigate('/catalog/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Crear Producto
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              {filteredProducts.map((product, idx) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/catalog/${product.id}`)}
                  className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.99] text-left group ${
                    idx !== filteredProducts.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                  }`}
                >
                  {/* Indicador de stock */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    product.quantity > 10 ? 'bg-emerald-400' :
                    product.quantity > 0 ? 'bg-amber-400' :
                    'bg-rose-400'
                  }`} />

                  {/* Avatar con inicial */}
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-black text-indigo-600">{product.name.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{product.categoryName}</p>
                  </div>

                  {/* Precio y stock */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-black text-indigo-600">${product.price.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-slate-400 font-medium">{product.quantity} uds.</p>
                  </div>

                  {/* Flecha Drill-Down */}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Atributos ─── */}
      {activeTab === 'attributes' && (
        <AttributeList
          attributes={attributes}
          onEdit={handleEditAttr}
          onDelete={(id) => setConfirmDelete({ type: 'attribute', id })}
          onAdd={handleAddAttr}
        />
      )}

      {/* ─── TAB: Categorías ─── */}
      {activeTab === 'categories' && (
        <CategoryList
          categories={categories}
          onEdit={(cat) => { setEditCategory(cat); setIsCatModalOpen(true); }}
          onDelete={(id) => setConfirmDelete({ type: 'category', id })}
        />
      )}

      {/* ─── Modales (solo para atributos y categorías) ─── */}
      <AttributeModal
        isOpen={isAttrModalOpen}
        attribute={editAttribute}
        productId={attrProductId}
        products={products}
        onClose={() => setIsAttrModalOpen(false)}
        onSave={handleSaveAttr}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        category={editCategory}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title={confirmDelete ? deleteMessages[confirmDelete.type].title : ''}
        message={confirmDelete ? deleteMessages[confirmDelete.type].message : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
