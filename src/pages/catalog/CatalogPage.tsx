import { useEffect, useState, useMemo } from 'react';
import { Plus, PackageOpen, Tag, FolderOpen } from 'lucide-react';
import { catalogService } from '../../services/catalog.service';
import { Product, Category, ProductAttribute, ProductAttributeRequest, CategoryRequest } from '../../types/catalog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ProductFilters } from './components/ProductFilters';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { AttributeList } from './components/AttributeList';
import { AttributeModal } from './components/AttributeModal';
import { CategoryList } from './components/CategoryList';
import { CategoryModal } from './components/CategoryModal';

type Tab = 'products' | 'attributes' | 'categories';

export function CatalogPage() {
  // ─── Datos ───
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // ─── Productos: estado ───
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // ─── Atributos: estado ───
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editAttribute, setEditAttribute] = useState<ProductAttribute | null>(null);
  const [attrProductId, setAttrProductId] = useState<string | null>(null);

  // ─── Categorías: estado ───
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // ─── Confirmación ───
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'attribute' | 'category'; id: string } | null>(null);

  // ─── Fetch ───
  const fetchAll = async () => {
    try {
      const [p, c, a] = await Promise.all([
        catalogService.getProducts(),
        catalogService.getCategories(),
        catalogService.getAttributes(),
      ]);
      setProducts(p);
      setCategories(c);
      setAttributes(a);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Productos: filtrado ───
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  // ─── Productos: acciones ───
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleEditFromDetail = (product: Product) => {
    setIsDetailOpen(false);
    setEditProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteFromDetail = (id: string) => {
    setIsDetailOpen(false);
    setConfirmDelete({ type: 'product', id });
  };

  const handleNewProduct = () => {
    setEditProduct(null);
    setIsFormOpen(true);
  };

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
      fetchAll();
    } catch (error) {
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
      fetchAll();
    } catch (error) {
      alert('Error al guardar la categoría');
    }
  };

  // ─── Confirmar eliminación ───
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
      fetchAll();
    } catch (error) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona productos, atributos y categorías</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'products') handleNewProduct();
            else if (activeTab === 'attributes') { setEditAttribute(null); setAttrProductId(null); setIsAttrModalOpen(true); }
            else if (activeTab === 'categories') { setEditCategory(null); setIsCatModalOpen(true); }
          }}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'products' ? 'Nuevo Producto' : activeTab === 'attributes' ? 'Nuevo Atributo' : 'Nueva Categoría'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center ${
              activeTab === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ TAB: Productos ═══ */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories}
          />

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <PackageOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No hay productos</p>
              <p className="text-xs text-slate-400 mt-1">Agrega tu primer producto al catálogo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Atributos ═══ */}
      {activeTab === 'attributes' && (
        <AttributeList
          attributes={attributes}
          onEdit={handleEditAttr}
          onDelete={(id) => setConfirmDelete({ type: 'attribute', id })}
          onAdd={handleAddAttr}
        />
      )}

      {/* ═══ TAB: Categorías ═══ */}
      {activeTab === 'categories' && (
        <CategoryList
          categories={categories}
          onEdit={(cat) => { setEditCategory(cat); setIsCatModalOpen(true); }}
          onDelete={(id) => setConfirmDelete({ type: 'category', id })}
        />
      )}

      {/* ═══ Modals ═══ */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <ProductFormModal
        isOpen={isFormOpen}
        product={editProduct}
        categories={categories}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchAll}
      />

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
