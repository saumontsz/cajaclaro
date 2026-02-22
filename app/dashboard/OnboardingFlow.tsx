'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'
import { AlertCircle, Building2 } from 'lucide-react'

// Asegúrate de que los props coincidan con lo que pasas desde page.tsx
export default function OnboardingForm({ tipoPerfil = 'empresa' }: { tipoPerfil?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // ESTA ES LA FUNCIÓN QUE SOLUCIONA EL TYPE ERROR
  // Al ser async y no tener un 'return' explícito, devuelve Promise<void>
  const handleAction = async (formData: FormData) => {
    setError(null)
    setIsPending(true)

    // Llamamos a la acción del servidor y guardamos el resultado
    const result = await crearNegocio(formData)

    // Si el resultado trae un error, lo manejamos en el estado de la UI
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // Si no hay error, el redirect o revalidatePath dentro de crearNegocio
    // se encargará de mover al usuario, por lo que no necesitamos retornar nada.
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
      
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <Building2 className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bienvenido</h2>
        <p className="text-slate-500 text-sm">Configura tu perfil para continuar.</p>
      </div>

      {/* Alerta de Error Visible */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* LA CLAVE: Usamos 'handleAction' en lugar de 'crearNegocio' directamente */}
      <form action={handleAction} className="space-y-6">
        <input type="hidden" name="tipo_perfil" value={tipoPerfil} />

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del Negocio</label>
            <input 
              name="nombre" 
              type="text" 
              required 
              placeholder="Ej: Constructora Saumont"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Saldo Inicial</label>
              <input name="saldo_actual" type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Ingresos Est.</label>
              <input name="ingresos_mensuales" type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all" />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {isPending ? "Configurando..." : "Finalizar Configuración"}
        </button>
      </form>
    </div>
  )
}