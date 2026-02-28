'use client'

import { useState, useTransition } from 'react'
import { 
  Key, Copy, CheckCircle2, RefreshCw, Eye, EyeOff, 
  Webhook, Loader2, Clock, Check, Sparkles, AlertTriangle 
} from 'lucide-react'
import { generarApiKey } from './actions'

interface ApiSettingsProps {
  plan: string;
  apiKey: string | null;
  negocioId: string;
}

export default function ApiSettings({ plan, apiKey, negocioId }: ApiSettingsProps) {
  const [mostrarKey, setMostrarKey] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [isPending, startTransition] = useTransition()

  const manejarGenerar = () => {
    if (apiKey) {
      const confirmar = confirm("Si regeneras la clave, las integraciones actuales dejarán de funcionar. ¿Continuar?");
      if (!confirmar) return;
    }
    
    startTransition(async () => {
      await generarApiKey(negocioId);
    });
  }

  const copiarAlPortapapeles = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm transition-all flex flex-col h-fit w-full">
      
      {/* HEADER DINÁMICO */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl">
            <Webhook size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">API & Conectores</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Automatización Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
           <Sparkles size={10} className="text-purple-500" />
           <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">{plan}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        Conecta <span className="font-bold text-slate-700 dark:text-slate-300">Flujent</span> con tu software de reservas, ERP o sistema de ventas para inyectar transacciones en tiempo real.
      </p>

      {/* ZONA DE CREDENCIALES */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em] ml-1">
          Secret API Token
        </label>
        
        {apiKey ? (
          <div className="space-y-4">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 shadow-sm group">
              <div className="flex-1 min-w-0">
                <code className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold break-all">
                  {mostrarKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                </code>
              </div>
              <button 
                onClick={() => setMostrarKey(!mostrarKey)} 
                className="ml-3 p-1 text-slate-300 hover:text-purple-500 transition-colors shrink-0"
              >
                {mostrarKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={copiarAlPortapapeles}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-slate-900/10"
              >
                {copiado ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copiado ? 'Copiado' : 'Copiar Clave'}
              </button>
              
              <button 
                onClick={manejarGenerar}
                disabled={isPending}
                className="flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-purple-500 px-5 rounded-2xl transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <button 
              onClick={manejarGenerar}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-purple-500/20"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
              {isPending ? 'Generando...' : 'Activar Acceso API'}
            </button>
          </div>
        )}
      </div>

      {/* ADVERTENCIA SEMÁNTICA */}
      <div className="mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-3 items-start">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-800/80 dark:text-amber-500/80 leading-relaxed font-medium uppercase tracking-tight">
          <span className="font-black text-amber-600 dark:text-amber-400">Seguridad:</span> Esta clave permite inyectar datos financieros. Nunca la compartas ni la uses en clientes frontend públicos.
        </p>
      </div>

      {/* FOOTER DE CAPACIDADES */}
      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Central de Conexiones</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
            <h5 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Check size={14} /> Ready to go
            </h5>
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-[10px] font-bold text-emerald-600/80">• Zapier / Make</span>
              <span className="text-[10px] font-bold text-emerald-600/80">• Webhooks v1</span>
              <span className="text-[10px] font-bold text-emerald-600/80">• POS Externo</span>
              <span className="text-[10px] font-bold text-emerald-600/80">• Booking Engine</span>
            </div>
          </div>

          <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 border-dashed">
            <h5 className="text-[10px] font-black text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <Clock size={14} /> Roadmap
            </h5>
            <p className="text-[10px] text-blue-600/70 dark:text-blue-500/70 font-medium italic">Sincronización automática con terminales de pago Transbank y Mercado Pago en desarrollo.</p>
          </div>
        </div>
      </div>

    </div>
  )
}