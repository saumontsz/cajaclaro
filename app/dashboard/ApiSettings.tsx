'use client'

import { useState, useTransition } from 'react'
import { Key, Copy, CheckCircle2, RefreshCw, Eye, EyeOff, Webhook, Loader2 } from 'lucide-react'
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
    // Si ya hay una key, pedimos confirmación antes de regenerarla
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all flex flex-col h-fit">
      
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {/* CAMBIO: Icono morado */}
          <Webhook size={18} className="text-purple-500" /> API & Webhooks
        </h3>
        {/* CAMBIO: Etiqueta morada */}
        <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-lg">
          Empresa
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
        Usa tu clave API para conectar <strong className="text-slate-700 dark:text-slate-300">Flujent</strong> con otras plataformas (ej: tu sistema de reservas o Zapier) y automatizar el registro de ingresos y gastos.
      </p>

      {/* ZONA DE LA LLAVE */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Clave API Secreta</label>
        
        {apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between font-mono text-sm">
                <span className="text-slate-800 dark:text-slate-200 truncate pr-4">
                  {mostrarKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                </span>
                <button 
                  onClick={() => setMostrarKey(!mostrarKey)} 
                  // CAMBIO: Hover del icono en morado
                  className="text-slate-400 hover:text-purple-500 transition-colors shrink-0"
                  title={mostrarKey ? "Ocultar" : "Mostrar"}
                >
                  {mostrarKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={copiarAlPortapapeles}
                // CAMBIO: Botón principal morado con sombra morada
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-purple-500/20 active:scale-95"
              >
                {copiado ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar clave'}
              </button>
              
              <button 
                onClick={manejarGenerar}
                disabled={isPending}
                className="flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 rounded-xl transition-all disabled:opacity-50"
                title="Regenerar clave"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Key size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 mb-4">No has generado una clave API aún.</p>
            <button 
              onClick={manejarGenerar}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
              {isPending ? 'Generando...' : 'Generar Clave API'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
        <strong>Atención:</strong> Esta clave da acceso total para escribir en la base de datos de tu negocio. Nunca la compartas ni la expongas en código frontend público.
      </div>
    </div>
  )
}