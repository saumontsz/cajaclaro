'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'
import { AlertCircle } from 'lucide-react'

export default function OnboardingFlow() {
  const [errorUI, setErrorUI] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // ESTA ES LA FUNCIÓN QUE SOLUCIONA EL ERROR
  // Al ser async y no tener un "return", TypeScript la marca como 'void'
  const handleFormAction = async (formData: FormData) => {
    setErrorUI(null)
    setIsPending(true)

    // Llamamos a la acción del servidor
    const result = await crearNegocio(formData)

    // Si hay un error, lo guardamos en el estado local de la interfaz
    if (result?.error) {
      setErrorUI(result.error)
      setIsPending(false)
    }
    // Si no hay error, el 'redirect' dentro de 'crearNegocio' hará el resto
  }

  return (
    <div className="max-w-md w-full">
      {/* 1. Mostramos el error si existe */}
      {errorUI && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {errorUI}
        </div>
      )}

      {/* 2. IMPORTANTE: Usamos 'handleFormAction' y NO 'crearNegocio' directamente */}
      <form action={handleFormAction} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
            Nombre del Negocio
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
          />
        </div>

        {/* ... el resto de tus inputs (saldo, ingresos, etc) ... */}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Configurando..." : "Finalizar Configuración"}
        </button>
      </form>
    </div>
  )
}