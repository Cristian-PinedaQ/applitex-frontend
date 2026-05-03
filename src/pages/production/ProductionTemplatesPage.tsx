import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  FileText,
  Loader2,
  X,
  Tag,
  Package
} from 'lucide-react';
import { ProductionService, ProductionTemplatePayload } from '../../services/production.service';
import { catalogService } from '../../services/catalog.service';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId?: string;
}

interface TemplateDetailProps {
  template: ProductionTemplatePayload;
  categoryName: string;
  productName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TemplateDetailModal({ template, categoryName, productName, onClose, onEdit, onDelete }: TemplateDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{template.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Categoría:</span>
            <span className="font-medium text-slate-900 dark:text-white">{categoryName}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Producto:</span>
            <span className="font-medium text-slate-900 dark:text-white">{productName}</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              Campos ({template.fields?.length || 0})
            </h4>
            <div className="space-y-2">
              {template.fields?.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="font-medium text-slate-900 dark:text-white">{field.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium uppercase">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
                        Obligatorio
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!template.fields || template.fields.length === 0) && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Sin campos configurados</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button onClick={onDelete} className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 rounded-xl font-semibold transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductionTemplatesPage() {
  const [templates, setTemplates] = useState<ProductionTemplatePayload[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ProductionTemplatePayload | null>(null);
  
  const [filters, setFilters] = useState({
    categoryId: '',
    productId: ''
  });

  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

const loadData = async () => {
    setIsLoading(true);
    try {
      const [templatesDataResponse, categoriesData] = await Promise.all([
        ProductionService.getTemplates(filters.categoryId || filters.productId ? {
          categoryId: filters.categoryId || undefined,
          productId: filters.productId || undefined
        } : undefined),
        catalogService.getCategories()
      ]);
      
      setTemplates(templatesDataResponse);
      
      // Extraer categorías: {id, name}
      const cats = (categoriesData || []).map((c: any) => ({
        id: c.id,
        name: c.name
      }));
      console.log('[CATEGORIES] flatten:', JSON.stringify(cats));
      setCategories(cats);
      
      // Extraer productos de cada categoría: usar 'productName'
      const prods: any[] = [];
      (categoriesData || []).forEach((c: any) => {
        if (c.products) {
          c.products.forEach((p: any) => prods.push({
            id: p.id,
            name: p.productName || p.name
          }));
        }
      });
      console.log('[PRODUCTS] flatten:', JSON.stringify(prods));
      setProducts(prods);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar plantilla "${name}"?`)) return;
    
    try {
      await ProductionService.deleteTemplate(id);
      toast.success('Plantilla eliminada');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar plantilla');
    }
  };

const getCategoryName = (template: ProductionTemplatePayload) => {
    const t = template as any;
    
    // Si el backend envía directamente
    if (t.categoryName) return t.categoryName;
    
    // Si tiene categoryId asignado
    if (template.categoryId && categories.length > 0) {
      const cat = categories.find(c => String(c.id) === String(template.categoryId));
      if (cat?.name) return cat.name;
    }
    
    return '-';
  };

  const getProductName = (template: ProductionTemplatePayload) => {
    const t = template as any;
    
    // PRIORIDAD 1: Si el backend envía directamente 'productName' en la plantilla
    if (t.productName) return t.productName;
    
    // PRIORIDAD 2: Si tiene productId asignado, buscar en la lista de productos
    if (template.productId && products.length > 0) {
      console.log('[PRODUCTS] Buscando productId:', template.productId);
      console.log('[PRODUCTS] Lista productos:', products.map(p => ({ id: p.id, name: p.name })));
      const prod = products.find(p => String(p.id) === String(template.productId));
      console.log('[PRODUCTS] Encontrado:', prod);
      if (prod?.name) return prod.name;
    }
    
    // Si no hay producto específico
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Plantillas de Producción
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona las plantillas usadas en órdenes de producción
          </p>
        </div>
        <Link
          to="/production/templates/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Plantilla
        </Link>
      </div>

      {/* Filters - responsive wrap */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Categoría:</span>
        </div>
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value, productId: '' }))}
          className="flex-1 sm:flex-none sm:w-40 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-900 dark:text-white min-w-0"
        >
          <option value="">Todas</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Producto:</span>
        </div>
        <div className="relative flex-1 sm:flex-none sm:w-48">
          <input
            type="text"
            value={productSearchQuery}
            onChange={async (e) => {
              const query = e.target.value;
              setProductSearchQuery(query);
              setShowProductSuggestions(true);
              if (query.length >= 2) {
                try {
                  const results = await catalogService.searchProducts(query);
                  setProductSuggestions(results);
                } catch (err) {
                  console.error('Error searching products:', err);
                }
              } else {
                setProductSuggestions([]);
              }
            }}
            onFocus={() => setShowProductSuggestions(true)}
            onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)}
            placeholder={filters.productId ? 'Cambiar producto...' : 'Buscar producto...'}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {showProductSuggestions && productSuggestions.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg">
              {productSuggestions.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    setFilters(f => ({ ...f, productId: prod.id }));
                    setProductSearchQuery(prod.name);
                    setShowProductSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {prod.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {filters.productId && (
          <button
            type="button"
            onClick={() => {
              setFilters(f => ({ ...f, productId: '' }));
              setProductSearchQuery('');
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}

        <button
          onClick={loadData}
          className="w-full sm:w-auto px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Table with horizontal scroll */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No hay plantillas configuradas
            </p>
            <Link
              to="/production/templates/new"
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Crear primera plantilla
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Campos
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {templates.map(template => (
                  <tr 
                    key={template.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {getCategoryName(template)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {getProductName(template)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                        {template.fields?.length || 0} campos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/production/templates/${template.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(template.id!, template.name); }}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          categoryName={getCategoryName(selectedTemplate)}
          productName={getProductName(selectedTemplate)}
          onClose={() => setSelectedTemplate(null)}
          onEdit={() => {
            const id = selectedTemplate.id;
            setSelectedTemplate(null);
            if (id) window.location.href = `/production/templates/${id}`;
          }}
          onDelete={() => {
            handleDelete(selectedTemplate.id!, selectedTemplate.name);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}