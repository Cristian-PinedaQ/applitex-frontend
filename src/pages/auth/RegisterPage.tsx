import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AuthService } from '../../services/auth.service';
import { Building2, Mail, KeyRound, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import logo from '../../assets/logo.webp';

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState(1);
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tenantName || !tenantId) {
      setError('Debes llenar el nombre y un identificador único para tu taller.');
      return;
    }
    // Simple validation for tenantId (no spaces)
    if (/\s/.test(tenantId)) {
      setError('El identificador no puede contener espacios. Ej: mitaler123');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.registerTenant({ 
        tenantId: tenantId.toLowerCase(), 
        tenantName, 
        email, 
        password 
      });
      // Inyección automática a la memoria Zustand
      login(response.token, response.tenantId, response.email, response.role, false);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Error al procesar el registro global.'
      );
      setStep(1); // Volver para revisión
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] md:top-0 left-[-10%] md:left-0 w-[40rem] h-[40rem] bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] md:bottom-0 right-[-10%] md:right-0 w-[40rem] h-[40rem] bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

      <div className="max-w-md w-full glass dark:glass-dark rounded-[2rem] p-8 md:p-10 border border-white/50 dark:border-slate-700/50 shadow-2xl relative z-10 
                      animate-in slide-in-from-bottom-6 fade-in duration-500">
        
        <button onClick={() => navigate('/login')} className="absolute top-8 left-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <img src={logo} alt="Applitex Logo" className="mx-auto w-40 h-40 object-contain mb-2 drop-shadow-2xl filter brightness-110" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Abre tu Taller Web
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {step === 1 ? 'Configuremos la base de tu empresa' : 'Crea tus credenciales de Dueño Absoluto'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-semibold rounded-[1rem] border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-5 text-left">
          
          {/* STEP 1: EMPRESA */}
          <div className={`space-y-5 transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Razón Social o Nombre del Taller</label>
              <div className="relative">
                <input
                  type="text"
                  required={step === 1}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder:text-slate-500"
                  placeholder="ej: Confecciones Elitte S.A.S"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Id de Acceso (Sin espacios)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  required={step === 1}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder:text-slate-500"
                  placeholder="ej: elitte (Este será tu Tenant)"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value.toLowerCase())}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Continuar a Seguridad
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 2: CREDENCIALES DUEÑO */}
          <div className={`space-y-5 transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Correo Electrónico (Dueño)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="email"
                  required={step === 2}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder:text-slate-500"
                  placeholder="ceo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Contraseña Maestra</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  required={step === 2}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Intenta usar más de 6 carácteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[1.25rem] font-semibold transition-all active:scale-[0.98] flex items-center justify-center shadow-sm"
              >
                Volver
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-3.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 rounded-[1.25rem] font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 dark:shadow-none disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Fundar Empresa
                    <Building2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
