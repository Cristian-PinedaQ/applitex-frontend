import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../config/api';
import { KeyRound, ShieldCheck, Loader2, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import logo from '../../assets/logo.webp';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        oldPassword,
        newPassword,
        confirmPassword
      });
      
      setSuccess(true);
      setTimeout(() => {
        // Después de cambiar clave, es mejor forzar re-login por seguridad (tokenVersion incrementado)
        logout();
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Error al cambiar la contraseña. Verifica tus datos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-100 dark:bg-primary-900/30 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="max-w-md w-full glass dark:glass-dark rounded-[2.5rem] p-8 md:p-10 text-center border border-white/50 dark:border-slate-700/50 shadow-2xl relative z-10 w-full animate-in fade-in zoom-in duration-300">
        <img src={logo} alt="Applitex Logo" className="mx-auto w-32 h-32 object-contain mb-4 filter drop-shadow-xl" />
        
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
          Actualización de Seguridad
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
          Por políticas de seguridad, debes actualizar tu contraseña antes de continuar.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-2xl border border-red-100 dark:border-red-900/30 animate-in shake duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-2xl border border-green-100 dark:border-green-900/30 animate-in fade-in duration-300">
            ✓ Contraseña actualizada correctamente. Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">Contraseña Actual</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showPasswords ? "text" : "password"}
                required
                className="w-full pl-10 pr-10 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                placeholder="Ingresa tu clave actual"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showPasswords ? "text" : "password"}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showPasswords ? "text" : "password"}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-medium text-slate-800 dark:text-slate-200"
                placeholder="Repite tu nueva clave"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-none disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Actualizar y Entrar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="mt-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold transition-colors"
        >
          Cerrar sesión y volver
        </button>
      </div>
    </div>
  );
}
