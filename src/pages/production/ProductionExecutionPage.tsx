import { useState } from 'react';
import { 
  ArrowLeft,  
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronDown,
  FileText,
  Activity,
  History,
  Signature
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const MOCK_ORDER_DETAIL = {
  id: 'OP-2024-001',
  osReference: 'OS-8829',
  reference: 'Lote Camisas Oxford L',
  status: 'IN_PROGRESS',
  items: [
    {
      id: 'ITM-001',
      name: 'Tela Oxford Premium Azul',
      sku: 'TEL-OXF-01',
      ordered: 150,
      reserved: 150,
      available: 2450,
      consumed: 95,
      unit: 'Mts'
    },
    {
      id: 'ITM-002',
      name: 'Botón Nácar 12mm',
      sku: 'ACC-BOT-12',
      ordered: 1200,
      reserved: 1200,
      available: 8500,
      consumed: 800,
      unit: 'Und'
    }
  ]
};

export function ProductionExecutionPage() {
  const {} = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState(MOCK_ORDER_DETAIL.items);
  const [activeTab, setActiveTab] = useState<'execution' | 'reports' | 'ledger'>('execution');
  const [idempotencyKey] = useState(crypto.randomUUID());

  const updateConsumed = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, consumed: numValue } : item
    ));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* ELITE HEADER & NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/production')}
            className="p-2.5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{MOCK_ORDER_DETAIL.reference}</h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {MOCK_ORDER_DETAIL.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Ref: <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{MOCK_ORDER_DETAIL.id}</span> • Vinculada a <span className="text-indigo-600 dark:text-indigo-500 font-bold">{MOCK_ORDER_DETAIL.osReference}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl font-bold transition-all border border-slate-200 dark:border-white/10 active:scale-95 shadow-sm dark:shadow-none">
            <RotateCcw className="w-5 h-5" />
            Resetear
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
            <CheckCircle2 className="w-5 h-5" />
            Finalizar OP
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl w-fit shadow-sm dark:shadow-none">
        {[
          { id: 'execution', label: 'Ejecución y Consumo', icon: Activity },
          { id: 'reports', label: 'Reportes de Calidad', icon: FileText },
          { id: 'ledger', label: 'Auditoría (Ledger)', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* EXECUTION VIEW */}
      {activeTab === 'execution' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Execution List */}
          <div className="xl:col-span-2 space-y-4">
            {items.map((item) => {
              const variance = item.consumed - item.ordered;

              return (
                <div key={item.id} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-indigo-500/20 rounded-3xl p-8 transition-all shadow-xl shadow-slate-200/40 dark:shadow-none group">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-500 font-mono font-bold tracking-tight uppercase tracking-widest">{item.sku}</p>
                      
                      <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Ordenado</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">{item.ordered}<span className="text-xs text-slate-400 ml-1 font-normal uppercase">{item.unit}</span></p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 text-center">
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest mb-1">Reservado</p>
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{item.reserved}<span className="text-xs text-indigo-400 ml-1 font-normal uppercase">{item.unit}</span></p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Disponible</p>
                          <p className="text-xl font-black text-slate-900 dark:text-slate-200">{item.available}<span className="text-xs text-slate-400 ml-1 font-normal uppercase">{item.unit}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Consumption Input */}
                    <div className="w-full md:w-72 space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.2em] mb-3 px-1">Consumo Real</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner group-focus-within:ring-4 group-focus-within:ring-indigo-500/10">
                          <input 
                            type="number"
                            value={item.consumed}
                            onChange={(e) => updateConsumed(item.id, e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-3xl font-black text-slate-900 dark:text-white w-full text-right px-2"
                          />
                          <span className="text-slate-400 dark:text-slate-500 font-black pr-2 uppercase">{item.unit}</span>
                        </div>
                      </div>

                      {/* Variance Indicator */}
                      <div className={`flex items-center justify-between p-4 rounded-xl border ${
                        variance === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        variance < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {variance === 0 ? <CheckCircle2 className="w-4 h-4" /> : 
                           variance < 0 ? <ChevronDown className="w-4 h-4" /> : 
                           <AlertTriangle className="w-4 h-4" />}
                          <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            {variance === 0 ? 'Correcto' : variance < 0 ? 'Subconsumo' : 'Warning'}
                          </span>
                        </div>
                        <span className="font-mono font-black text-sm">
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <h4 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Resumen de Consumo
              </h4>
              <div className="space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total ítems</span>
                  <span className="text-slate-900 dark:text-white font-black">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Eficiencia Global</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">98.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Variación Neta</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">+5.2 Mts</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/10 dark:bg-indigo-600/10 border border-indigo-600/20 dark:border-indigo-500/30 rounded-[2rem] p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/40">
                  <Signature className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-black text-indigo-900 dark:text-white uppercase tracking-widest">Firma Digital</h4>
              </div>
              <p className="text-xs text-indigo-900/60 dark:text-slate-300 font-medium leading-relaxed mb-8">
                Al finalizar la orden, se generará un reporte inmutable con snapshot de inventario y firma digital del operario.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-indigo-200 dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-[0.2em] mb-2 px-1">Idempotency Token</p>
                  <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate font-bold">{idempotencyKey}</p>
                </div>
                <button 
                  onClick={() => navigate('/production/templates/new')}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                  Configurar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEDGER VIEW */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none animate-in fade-in duration-500">
          <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Production Ledger</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">Registro inmutable de eventos operativos (Append-only)</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">En Línea</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10">Evento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10">Fecha y Hora</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10">Responsable</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  { event: 'COMPLETED', time: '2024-04-24 15:30:01', user: 'Admin System', detail: 'Orden cerrada con reporte #882', color: 'text-emerald-600 dark:text-emerald-400' },
                  { event: 'CONSUMED', time: '2024-04-24 14:15:22', user: 'Juan Perez', detail: 'Consumo: 800 Und de ACC-BOT-12', color: 'text-indigo-600 dark:text-indigo-400' },
                  { event: 'CONSUMED', time: '2024-04-24 14:12:05', user: 'Juan Perez', detail: 'Consumo: 95 Mts de TEL-OXF-01', color: 'text-indigo-600 dark:text-indigo-400' },
                  { event: 'CREATED', time: '2024-04-24 09:00:00', user: 'System Agent', detail: 'OP generada desde OS-8829', color: 'text-slate-600 dark:text-slate-300' },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 ${log.color}`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-slate-500 dark:text-slate-300 font-bold">{log.time}</td>
                    <td className="px-8 py-5 text-xs font-black text-slate-900 dark:text-slate-100">{log.user}</td>
                    <td className="px-8 py-5 text-xs text-slate-500 dark:text-slate-400 text-right italic font-medium">{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
