'use client'

import { useState } from 'react'
import { Lock, Copy, Check, Zap, Eye, EyeOff } from 'lucide-react'

interface Props {
  plan: string;
  apiKey: string;
}

export default function ApiSettings({ plan, apiKey }: Props) {
  const [copiado, setCopiado] = useState(false)
  const [mostrarLlave, setMostrarLlave] = useState(false)

  const copiarLlave = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const tieneApi = plan === 'empresa'
  const llaveOculta = '•'.repeat(apiKey?.length || 32)

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8 transition-colors">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          {/* Cambiamos el amarillo por morado de lujo */}
          <Zap size={18} className={tieneApi ? "text-purple-500" : "text-gray-400 dark:text-gray-500"} />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">Automatización y API</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
          tieneApi ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
        }`}>
          Plan {plan}
        </span>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors">
          Conecta CajaClaro con sistemas externos (como tu web de reservas, Shopify o Zapier) para que tus ingresos se registren automáticamente sin mover un dedo.
        </p>

        {tieneApi ? (
          <div className="bg-purple-50/50 dark:bg-slate-800/50 p-4 rounded-lg border border-purple-100 dark:border-slate-700 overflow-hidden transition-colors">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tu Llave Secreta (API Key)
            </label>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 relative min-w-0">
                <code className="block w-full bg-white dark:bg-slate-950 px-3 py-2.5 rounded border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-gray-200 font-mono overflow-hidden text-ellipsis whitespace-nowrap pr-10 font-medium transition-colors">
                  {mostrarLlave ? apiKey : llaveOculta}
                </code>
                <button 
                  onClick={() => setMostrarLlave(!mostrarLlave)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-1"
                  type="button"
                >
                  {mostrarLlave ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={copiarLlave}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 dark:bg-purple-600 text-white rounded hover:bg-gray-800 dark:hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shrink-0"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <p className="text-xs text-purple-700 dark:text-purple-300 mt-3 font-medium flex items-start gap-1.5 bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-100 dark:border-purple-800/50 transition-colors">
              <Lock size={14} className="shrink-0 mt-0.5" />
              <span>Seguridad: Mantén esta llave en secreto. Otorga acceso directo para registrar transacciones.</span>
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-lg p-8 text-center flex flex-col items-center justify-center transition-colors">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mb-4 transition-colors">
              <Lock size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Función Exclusiva para Empresas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed transition-colors">
              Actualiza al <strong>Plan Empresa</strong> para obtener tu llave secreta y automatizar todo.
            </p>
            {/* Botón Morado Sofisticado */}
            <button className="px-6 py-3 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm active:scale-[0.98]">
              Subir a Empresa — $20.000 CLP/mes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}