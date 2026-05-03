import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, Shield, Loader2, Save } from 'lucide-react';
import { User, UserRequest, UserRole } from '../../../types/users';
import { usersService } from '../../../services/users.service';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, onClose, onSuccess, user 
}) => {
  const [formData, setFormData] = useState<UserRequest>({
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_OPERATOR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '' // Contraseña vacía al editar
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'ROLE_OPERATOR'
      });
    }
    setError(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user) {
        await usersService.update(user.id, formData);
      } else {
        await usersService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'ROLE_SUPER_ADMIN', label: 'Super Administrador', description: 'Autoridad global sobre todas las empresas del sistema.' },
    { value: 'ROLE_ADMIN', label: 'Administrador', description: 'Control total de la empresa y equipo.' },
    { value: 'ROLE_SUPERVISOR', label: 'Supervisor', description: 'Gestión de catálogo, inventario y órdenes.' },
    { value: 'ROLE_OPERATOR', label: 'Operador', description: 'Registro de producción y visualización.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user ? 'Editar Miembro' : 'Nuevo Miembro'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-600 text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <UserPlus className="w-4 h-4 text-slate-400" />
              </div>
              <input
                required
                type="text"
                className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white"
                placeholder="Ej: Juan Pérez"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                required
                type="email"
                className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white"
                placeholder="usuario@applitex.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
              {user && <span className="text-[9px] font-bold text-amber-500">Dejar en blanco para no cambiar</span>}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                required={!user}
                type="password"
                className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Roles Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Rol y Permisos
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.role === r.value 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${formData.role === r.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${formData.role === r.value ? 'text-indigo-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {r.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {user ? 'Guardar Cambios' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
