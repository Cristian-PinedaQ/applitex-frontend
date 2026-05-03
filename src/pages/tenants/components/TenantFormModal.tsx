import React, { useEffect, useState } from "react";
import { Tenant, TenantCreateRequest } from "../../../services/tenants.service";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

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
    password: "",
    status: "ACTIVE" as any
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        id: tenant.id,
        name: tenant.name,
        adminEmail: tenant.adminEmail || "",
        password: "",
        status: tenant.status as any
      });
    } else {
      setFormData({ id: "", name: "", adminEmail: "", password: "" });
      setConfirmPassword("");
    }
    setError(null);
  }, [tenant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tenant) {
      if (formData.password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
      if (formData.password!.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password!)) {
        setError("La contraseña debe incluir al menos una letra y un número.");
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al procesar la solicitud.");
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

            {tenant && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado de la Organización
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ACTIVE', 'DELETED'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s as any })}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-semibold text-xs tracking-wider uppercase ${
                        formData.status === s
                          ? s === 'ACTIVE' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                            : 'bg-slate-50 border-slate-500 text-slate-700'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${s === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      {s === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Credenciales Administrativas
              </h3>
              
              <div className="space-y-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {tenant ? "Nueva Contraseña" : "Contraseña Admin"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!tenant}
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        placeholder={tenant ? "Dejar vacío para mantener" : "••••••••"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!tenant && !!formData.password}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        placeholder={tenant ? "Confirmar solo si cambia" : "••••••••"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <p className="text-[10px] text-amber-600 mt-1 font-medium italic">
                  {tenant 
                    ? "Si actualizas la contraseña, el administrador deberá cambiarla en su próximo login."
                    : "Se creará automáticamente un usuario administrador con cambio de clave obligatorio."}
                </p>
              </div>
            </div>

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
                className="btn-primary flex-1"
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
