'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'
import { Building2 } from 'lucide-react'

export default function OnboardingFlow({ tipoPerfil }: { tipoPerfil: string }) {
  // 1. Estado para atrapar el error y mostrarlo en el UI
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // 2. FUNCIÓN ENVOLTORIO (El "Traductor" para TypeScript)
  // Esta función devuelve Promise<void>, que es lo que el form quiere.
  const manejarAccion = async (formData: FormData) => {
    setError(null)
    setIsPending(true)

    try {
      const result = await crearNegocio(formData)
      
      // Si el server action nos mandó un error, lo guardamos aquí
      if (result?.error) {
        setError(result.error)
      }
    } catch (e) {
      setError("Ocurrió un error inesperado.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Bienvenido a Flujent</h1>
        <p className="text-slate-500 text-sm">Configura tu primer negocio para empezar.</p>
      </div>

      {/* 3. Mostrar el mensaje de error si existe */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* 4. IMPORTANTE: Usamos 'manejarAccion' en lugar de 'crearNegocio' */}
      <form action={manejarAccion} className="space-y-4">
        <input type="hidden" name="tipo_perfil" value={tipoPerfil} />
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del Negocio</label>
          <input 
            name="nombre" 
            type="text" 
            required 
            placeholder="Ej: Mi Constructora"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
          />
        </div>

        {/* Agrega aquí el resto de tus inputs (saldo_actual, etc.) de la misma forma */}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Creando..." : "Finalizar Configuración"}
        </button>
      </form>
    </div>
  )
}