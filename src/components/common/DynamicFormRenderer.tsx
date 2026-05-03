import { 
  Hash, 
  Type, 
  List as ListIcon, 
  ToggleLeft, 
  Calendar,
  Check,
  X
} from 'lucide-react';

interface Field {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  required: boolean;
  options?: string[];
}

interface TemplateSnapshot {
  id: string;
  name: string;
  categoryId?: string;
  productId?: string;
  fields?: Field[];
}

interface DynamicFormRendererProps {
  templateSnapshot?: TemplateSnapshot | null;
  filledData?: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

const fieldIcons = {
  TEXT: Type,
  NUMBER: Hash,
  SELECT: ListIcon,
  BOOLEAN: ToggleLeft,
  DATE: Calendar,
};

export function DynamicFormRenderer({ 
  templateSnapshot, 
  filledData = {}, 
  onChange,
  disabled = false 
}: DynamicFormRendererProps) {
  // 🧨 Defensa contra templateSnapshot inválido
  if (!templateSnapshot || !Array.isArray(templateSnapshot.fields) || templateSnapshot.fields.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-500 dark:text-slate-400">
        Esta plantilla no tiene campos configurados.
      </div>
    );
  }

  const handleChange = (fieldName: string, value: any) => {
    if (disabled) return;
    onChange({
      ...filledData,
      [fieldName]: value
    });
  };

  return (
    <div className="space-y-4">
      {templateSnapshot.fields.map((field) => {
        const Icon = fieldIcons[field.type] || Type;
        const value = filledData[field.name];

        return (
          <div key={field.id} className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Icon className="w-3.5 h-3.5" />
              {field.name}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'TEXT' && (
              <input
                type="text"
                disabled={disabled}
                placeholder={`Ingresa ${field.name.toLowerCase()}...`}
                value={value ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all disabled:opacity-50"
              />
            )}

            {field.type === 'NUMBER' && (
              <input
                type="number"
                disabled={disabled}
                placeholder="0"
                value={value ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all disabled:opacity-50"
              />
            )}

            {field.type === 'DATE' && (
              <input
                type="date"
                disabled={disabled}
                value={value ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all disabled:opacity-50"
              />
            )}

            {field.type === 'BOOLEAN' && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleChange(field.name, true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    value === true
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4 mx-auto" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleChange(field.name, false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    value === false
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <X className="w-4 h-4 mx-auto" />
                </button>
              </div>
            )}

            {field.type === 'SELECT' && (
              <select
                disabled={disabled}
                value={value ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all disabled:opacity-50"
              >
                <option value="">Selecciona {field.name.toLowerCase()}...</option>
                {field.options?.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}