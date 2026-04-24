import React, { useEffect, useState } from "react";
import { Tenant, TenantCreateRequest } from "../../../services/tenants.service";

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TenantCreateRequest) => Promise<void>;
  tenant?: Tenant | null;
}

const TenantFormModal = ({ isOpen, onClose, onSubmit, tenant }: TenantFormModalProps) => {
  const [formData, setFormData] = useState<TenantCreateRequest>({
    id: "",
    name: "",
    adminEmail: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        id: tenant.id,
        name: tenant.name,
        adminEmail: "", // No se edita por ahora
      });
    } else {
      setFormData({ id: "", name: "", adminEmail: "" });
    }
  }, [tenant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {tenant ? "Editar Empresa" : "Nueva Empresa"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {tenant 
              ? "Actualiza la información básica de la empresa."
              : "Configura el acceso para una nueva organización cliente."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Identificador (Slug)
              </label>
              <input
                type="text"
                required
                disabled={!!tenant}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="ej: tesla-motors"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
              {!tenant && (
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  Mín. 3 caracteres, solo minúsculas y guiones.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="ej: Tesla Motors Inc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {!tenant && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email del Administrador Principal
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="admin@empresa.com"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                />
                <p className="text-[10px] text-amber-600 mt-1 font-medium italic">
                  Se creará automáticamente un usuario administrador PENDIENTE.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Guardando..." : tenant ? "Guardar Cambios" : "Crear Empresa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantFormModal;
