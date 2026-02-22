'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'

export default function OnboardingFlow() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // 1. ESTA ES LA FUNCIÓN QUE "ENGAÑA" A TYPESCRIPT
  // Al no tener un 'return', TypeScript la marca como 'void', que es lo que el form pide.
  const handleAction = async (formData: FormData) => {
    setError(null)
    setIsPending(true)

    const result = await crearNegocio(formData)

    // Si la acción devolvió un error, lo guardamos en nuestro estado local
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // Si no hay error, Next.js hará el revalidatePath automáticamente
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
      
      {/* 2. Mostramos el error si existe */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* 3. IMPORTANTE: Aquí usamos 'handleAction' y NO 'crearNegocio' directamente */}
      <form action={handleAction} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
            Nombre del Negocio
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            placeholder="Ej: Constructora Saumont"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
          />
        </div>

        {/* Agrega tus otros inputs: saldo_actual, ingresos_mensuales, etc. */}
        <div className="grid grid-cols-2 gap-4">
           <input name="saldo_actual" type="number" placeholder="Saldo inicial" className="..." />
           <input name="ingresos_mensuales" type="number" placeholder="Ingresos est." className="..." />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Configurando..." : "Finalizar Configuración"}
        </button>
      </form>
    </div>
  )
}