import { useState } from "react";
import { Tenant } from "../../../services/tenants.service";

interface DeactivateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  tenant: Tenant | null;
}

const DeactivateTenantModal = ({ isOpen, onClose, onConfirm, tenant }: DeactivateTenantModalProps) => {
  const [confirmId, setConfirmId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !tenant) return null;

  const handleConfirm = async () => {
    if (confirmId !== tenant.id) return;
    setLoading(true);
    try {
      await onConfirm(tenant.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setConfirmId("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">Desactivar Empresa</h2>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Estás a punto de desactivar a <span className="font-bold text-slate-900">"{tenant.name}"</span>. 
            <br/><br/>
            <span className="text-red-600 font-medium">⚠️ Esta acción bloqueará el acceso a TODOS los usuarios de esta empresa de forma inmediata.</span>
          </p>

          <div className="bg-slate-50 p-4 rounded-xl mb-6">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
              Para confirmar, escribe el ID de la empresa: <span className="text-slate-900 font-bold">{tenant.id}</span>
            </p>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder={tenant.id}
              value={confirmId}
              onChange={(e) => setConfirmId(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmId !== tenant.id || loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Desactivando..." : "Sí, Desactivar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateTenantModal;
