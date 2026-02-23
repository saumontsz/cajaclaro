'use client'

import { useState, useTransition } from 'react'
import { Key, Copy, CheckCircle2, RefreshCw, Eye, EyeOff, Webhook, Loader2, Blocks, Clock, Check } from 'lucide-react'
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
      const confirmar = confirm("Si regeneras la API Key, cualquier integración actual dejará de funcionar. ¿Estás seguro?");
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm transition-all flex flex-col h-fit w-full max-w-md mx-auto">
      
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Webhook size={18} className="text-purple-500" /> API & Webhooks
        </h3>
        <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-lg tracking-wider">
          Empresa
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
        Usa tu clave API estándar (JSON) para inyectar transacciones a tu cuenta desde software de terceros.
      </p>

      {/* ZONA DE LA LLAVE */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
          Clave API Secreta
        </label>
        
        {apiKey ? (
          <div className="space-y-4">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate pr-2">
                  {mostrarKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                </p>
              </div>
              <button 
                onClick={() => setMostrarKey(!mostrarKey)} 
                className="text-slate-400 hover:text-purple-500 transition-colors shrink-0"
                title={mostrarKey ? "Ocultar" : "Mostrar"}
              >
                {mostrarKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={copiarAlPortapapeles}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 active:scale-95"
              >
                {copiado ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copiado ? 'Copiado' : 'Copiar clave'}
              </button>
              
              <button 
                onClick={manejarGenerar}
                disabled={isPending}
                className="flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 rounded-xl transition-all disabled:opacity-50"
                title="Regenerar clave"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-white dark:bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-800">
              <Key size={20} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[11px] text-slate-500 mb-4">No has generado una clave API aún.</p>
            <button 
              onClick={manejarGenerar}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {isPending ? 'Generando...' : 'Generar Clave API'}
            </button>
          </div>
        )}
      </div>

      {/* ALERTA */}
      <div className="mt-5 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-[10px] text-amber-800 dark:text-amber-500 leading-relaxed">
        <div className="flex gap-2">
          <span className="font-bold shrink-0">Atención:</span>
          <p>Esta clave da acceso para escribir en tu base de datos. Nunca la expongas en código frontend público.</p>
        </div>
      </div>

      {/* NUEVA SECCIÓN: CAPACIDADES Y PRÓXIMAMENTE */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Estado de Integraciones</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tarjeta: Funciona Hoy */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
            <h5 className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <Check size={14} /> Compatible ahora
            </h5>
            <ul className="text-[10px] text-emerald-600/90 dark:text-emerald-500/80 space-y-1.5 ml-1">
              <li>• Automatizaciones con Zapier o Make</li>
              <li>• Páginas de reservas propias</li>
              <li>• Softwares de punto de venta (vía webhook)</li>
            </ul>
          </div>

          {/* Tarjeta: Próximamente */}
          <div className="bg-blue-50/30 dark:bg-blue-900/10 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/30 border-dashed">
            <h5 className="text-[11px] font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <Clock size={14} /> Adaptadores nativos
            </h5>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-500/70 mb-2">Próximamente conexión en 1 clic sin usar código para:</p>
            <ul className="text-[10px] text-blue-600/90 dark:text-blue-500/80 space-y-1.5 ml-1 font-medium">
              <li>• Transbank / Webpay Plus</li>
              <li>• Mercado Pago (Maquinitas POS)</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}