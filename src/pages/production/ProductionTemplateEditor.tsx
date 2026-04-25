import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Type, 
  Hash, 
  List as ListIcon, 
  ToggleLeft, 
  Calendar,
  Save,
  ArrowLeft,
  Settings2
} from 'lucide-react';
import { ProductionService, ProductionTemplatePayload } from '../../services/production.service';
import { toast } from 'react-hot-toast';

interface Field {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  required: boolean;
  options?: string[];
}

export function ProductionTemplateEditor() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    const loadingToast = toast.loading('Guardando plantilla...');

    try {
      const payload: ProductionTemplatePayload = {
        name,
        fields: fields.map(({ id, ...rest }) => rest) // El backend genera IDs para los campos
      };

      await ProductionService.createTemplate(payload);
      
      toast.success('Plantilla creada correctamente', { id: loadingToast });
      navigate('/production');
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la plantilla', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const fieldIcons = {
    TEXT: Type,
    NUMBER: Hash,
    SELECT: ListIcon,
    BOOLEAN: ToggleLeft,
    DATE: Calendar
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* ELITE HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm dark:shadow-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Settings2 className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
              Editor de Plantillas
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Define los contratos de reporte para planta</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          <Save className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
          {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
        </button>
      </div>

      {/* TEMPLATE CONFIG */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-8 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div>
          <label className="block text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] mb-4 px-1">Nombre de la Plantilla</label>
          <input 
            type="text" 
            placeholder="Ej: Reporte de Calidad Textil"
            disabled={isLoading}
            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 rounded-2xl py-5 px-8 text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner disabled:opacity-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pt-4 space-y-6">
          <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Campos Dinámicos</h3>
            <button 
              onClick={addField}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors uppercase tracking-[0.15em] disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Agregar Campo
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field) => {
              const Icon = fieldIcons[field.type];
              return (
                <div key={field.id} className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 rounded-2xl transition-all shadow-sm dark:shadow-none">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors border border-slate-200 dark:border-white/5">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <input 
                    type="text" 
                    value={field.name}
                    disabled={isLoading}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-black placeholder:text-slate-300 dark:placeholder:text-slate-800 text-lg outline-none disabled:opacity-50"
                    placeholder="Nombre del campo..."
                  />

                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
                    {(Object.keys(fieldIcons) as Array<keyof typeof fieldIcons>).map((type) => (
                      <button
                        key={type}
                        disabled={isLoading}
                        onClick={() => updateField(field.id, { type })}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                          field.type === type 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-white/5'
                        } disabled:opacity-50`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      disabled={isLoading}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500/20 disabled:opacity-50"
                    />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Obligatorio</span>
                  </label>

                  <button 
                    onClick={() => removeField(field.id)}
                    disabled={isLoading}
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-slate-950/30">
                <Settings2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest text-xs">No hay campos definidos aún.<br/><span className="text-slate-400 dark:text-slate-500 font-medium lowercase">Empieza agregando uno arriba.</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
