import { X, Save, AlertCircle } from 'lucide-react';
import { Customer, CustomerRequest, DocumentType, CustomerType } from '../../../types/customer';
import { useState, useEffect } from 'react';

interface CustomerModalProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerRequest) => void;
}

export function CustomerModal({ customer, isOpen, onClose, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerRequest>({
    fullName: '',
    document: '',
    documentType: 'CC',
    address: '',
    city: '',
    email: '',
    businessName: '',
    phone: '',
    customerType: 'PERSONA_NATURAL',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        document: customer.document,
        documentType: customer.documentType,
        address: customer.address || '',
        city: customer.city || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        phone: customer.phone || '',
        customerType: customer.customerType,
        active: customer.active,
      });
    } else {
      setFormData({
        fullName: '',
        document: '',
        documentType: 'CC',
        address: '',
        city: '',
        email: '',
        businessName: '',
        phone: '',
        customerType: 'PERSONA_NATURAL',
        active: true,
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es obligatorio';
    if (!formData.document.trim()) newErrors.document = 'El documento es obligatorio';
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      newErrors.contact = 'Debes proveer al menos un medio de contacto (email o teléfono)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">Completa los datos del cliente para el sistema Applitex.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Info Básica */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Información Principal</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Nombre Completo / Razón Social"
                    className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border ${errors.fullName ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium`}
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.fullName}</p>}
                </div>

                <div className="flex gap-2">
                  <select
                    className="w-1/3 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-bold"
                    value={formData.documentType}
                    onChange={(e) => setFormData({...formData, documentType: e.target.value as DocumentType})}
                  >
                    <option value="CC">CC</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">CE</option>
                    <option value="PASSPORT">PAS</option>
                  </select>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Número de Documento"
                      className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border ${errors.document ? 'border-red-300' : 'border-slate-100'} focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium`}
                      value={formData.document}
                      onChange={(e) => setFormData({...formData, document: e.target.value})}
                    />
                    {errors.document && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.document}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo de Cliente</label>
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, customerType: 'PERSONA_NATURAL'})}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formData.customerType === 'PERSONA_NATURAL' ? 'bg-white shadow text-primary-700' : 'text-slate-500'}`}
                >
                  Persona
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, customerType: 'EMPRESA'})}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formData.customerType === 'EMPRESA' ? 'bg-white shadow text-primary-700' : 'text-slate-500'}`}
                >
                  Empresa
                </button>
              </div>
              <input
                type="text"
                placeholder="Nombre Comercial (Opcional)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Contacto</label>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Teléfono / WhatsApp"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Ubicación</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ciudad"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Dirección Completa"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white text-sm font-medium"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="md:col-span-2 pt-4 flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">Estado del Cliente</span>
                <span className="text-xs text-slate-400">Los clientes inactivos no aparecerán en las órdenes de servicio.</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, active: !formData.active})}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {errors.contact && (
              <div className="md:col-span-2 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                {errors.contact}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
