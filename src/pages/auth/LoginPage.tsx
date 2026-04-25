import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AuthService } from '../../services/auth.service';
import { ShieldCheck, Mail, KeyRound, Building2, Loader2, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login({ tenantId, email, password });
      
      // Persistir in Zustand
      login(response.token, response.tenantId, response.email, response.role);
      
      // Entrar al Dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Credenciales inválidas. Verifica tu Tenant e Email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] md:top-0 right-[-10%] md:right-0 w-[40rem] h-[40rem] bg-primary-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] md:bottom-0 left-[-10%] md:left-0 w-[40rem] h-[40rem] bg-indigo-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="max-w-md w-full glass rounded-[2rem] p-8 md:p-10 text-center border border-white/50 shadow-2xl relative z-10 w-full transform transition-all">
        <img src={logo} alt="Applitex Logo" className="mx-auto w-40 h-40 object-contain mb-2 drop-shadow-2xl filter brightness-110" />
        
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Bienvenido
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Ingresa tus credenciales para acceder a la gestión de tu taller textil.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-[1rem] border border-red-100 animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Identificador de Taller (Tenant)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="ej: master"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="admin@applitex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña Exclusiva</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.25rem] font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:active:scale-100 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Acceder a Consola
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 text-slate-500 text-sm">
          ¿No tienes un taller registrado?{' '}
          <button 
            onClick={() => navigate('/register')}
            className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors focus:outline-none"
          >
            Abre uno ahora
          </button>
        </div>
      </div>
    </div>
  );
}
