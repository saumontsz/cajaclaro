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

  const esPremium = plan === 'premium'

  // Función para ocultar la llave visualmente
  const llaveOculta = '•'.repeat(apiKey.length)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap size={18} className={esPremium ? "text-yellow-500" : "text-gray-400"} />
          <h3 className="text-base font-semibold text-gray-900">Automatización y API</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
          esPremium ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          Plan {plan}
        </span>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">
          Conecta CajaClaro con tus sistemas externos (como tu web de reservas, Shopify o Zapier) para que tus ingresos y gastos se registren automáticamente en tu flujo de caja sin mover un dedo.
        </p>

        {esPremium ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tu Llave Secreta (API Key)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <code className="block w-full bg-white px-3 py-2.5 rounded border border-gray-200 text-sm text-gray-800 font-mono overflow-hidden text-ellipsis whitespace-nowrap pr-10 font-medium">
                  {mostrarLlave ? apiKey : llaveOculta}
                </code>
                <button 
                  onClick={() => setMostrarLlave(!mostrarLlave)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  type="button"
                >
                  {mostrarLlave ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={copiarLlave}
                className="px-4 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium shrink-0"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-3 font-medium flex items-start gap-1.5 bg-yellow-50 p-2 rounded border border-yellow-100">
              <Lock size={14} className="shrink-0 mt-0.5" />
              <span>
                Seguridad: Mantén esta llave en secreto. Otorga acceso directo para registrar transacciones en tu caja.
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 mb-4">
              <Lock size={24} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Desbloquea tu API Key</h4>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Actualiza al plan Premium para obtener tu llave secreta y conectar CajaClaro con otras apps, automatizando tu negocio al 100%.
            </p>
            <button className="px-6 py-3 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm active:scale-[0.98]">
              Subir a Premium — $15/mes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}