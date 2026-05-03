import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  Settings2,
  Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductionService } from '../../services/production.service';
import { catalogService } from '../../services/catalog.service';
import { toast } from 'react-hot-toast';

interface Field {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  required: boolean;
  options?: string[];
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

export function ProductionTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesData] = await Promise.all([
          catalogService.getCategories()
        ]);
        setCategories(categoriesData);

        if (isEdit && id) {
          const template = await ProductionService.getTemplateById(id);
          setName(template.name);
          setCategoryId(template.categoryId || '');
          setProductId(template.productId || '');
          setFields(template.fields?.map(f => ({
            ...f,
            id: f.id || crypto.randomUUID()
          })) || []);
        }
      } catch (error) {
        console.error('Error loading:', error);
        toast.error('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  useEffect(() => {
    if (categoryId) {
      catalogService.getProductsByCategory(categoryId)
        .then(setProducts)
        .catch(console.error);
    } else {
      setProducts([]);
    }
  }, [categoryId]);

  const addField = () => {
    const newField: Field = {
      id: crypto.randomUUID(),
      name: '',
      type: 'TEXT',
      required: false
    };
    setFields([...fields, newField]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre de la plantilla es obligatorio');
      return;
    }

    if (fields.length === 0) {
      toast.error('Debes agregar al menos un campo');
      return;
    }

    if (fields.some(f => !f.name.trim())) {
      toast.error('Todos los campos deben tener un nombre');
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading(isEdit ? 'Actualizando plantilla...' : 'Guardando plantilla...');

    try {
      const payload: any = {
        name,
        categoryId: categoryId || undefined,
        fields: fields.map(({ id, ...rest }) => rest)
      };

      // El backend espera un objeto Product, no solo productId
      if (productId) {
        payload.productId = productId;
      }

      if (isEdit && id) {
        await ProductionService.updateTemplate(id, payload);
        toast.success('Plantilla actualizada', { id: loadingToast });
      } else {
        await ProductionService.createTemplate(payload);
        toast.success('Plantilla creada', { id: loadingToast });
      }
      
      navigate('/production/templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la plantilla', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('¿Eliminar esta plantilla?')) return;

    try {
      await ProductionService.deleteTemplate(id);
      toast.success('Plantilla eliminada');
      navigate('/production/templates');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/production/templates')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {isEdit ? 'Modifica la plantilla de producción' : 'Crea una plantilla para órdenes de producción'}
            </p>
          </div>
        </div>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 rounded-xl font-semibold transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Nombre de Plantilla
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Control de Calidad"
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setProductId(''); }}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            >
              <option value="">Selecciona categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Producto
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              disabled={!categoryId}
            >
              <option value="">Selecciona producto (opcional)...</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Campos
            </label>
            <button
              onClick={addField}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Campo
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              return (
                <div 
                  key={field.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  <span className="hidden sm:flex w-6 h-6 items-center justify-center bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-500 dark:text-slate-400">
                    {index + 1}
                  </span>
                  
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    placeholder="Nombre del campo"
                    className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                  />

                  <div className="flex items-center gap-2">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as Field['type'] })}
                      className="flex-1 sm:flex-none w-full sm:w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="TEXT">Texto</option>
                      <option value="NUMBER">Número</option>
                      <option value="DATE">Fecha</option>
                      <option value="BOOLEAN">Sí/No</option>
                      <option value="SELECT">Selección</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => updateField(field.id, { required: !field.required })}
                      className={`flex-1 sm:flex-none px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        field.required 
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {field.required ? 'Oblig.' : 'Opcional'}
                    </button>

                    <button
                      onClick={() => removeField(field.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Settings2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Agrega campos para collecting datos en producción
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEdit ? 'Actualizar' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}