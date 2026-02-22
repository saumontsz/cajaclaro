'use client'

import { useState } from 'react'
import { crearNegocio } from './actions' // Importamos tu action perfecta
import { AlertCircle, Building2 } from 'lucide-react'

export default function OnboardingForm({ tipoPerfil = 'empresa' }: { tipoPerfil?: string }) {
  const [errorUI, setErrorUI] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // ESTA FUNCIÓN ES EL "TRADUCTOR" QUE ARREGLA EL ERROR
  // No tiene un 'return', por lo tanto para TypeScript devuelve 'void'.
  const manejarEnvio = async (formData: FormData) => {
    setErrorUI(null)
    setIsPending(true)

    // Llamamos a la función de actions.ts
    const resultado = await crearNegocio(formData)

    // Si hubo un error, lo guardamos en el estado de la interfaz
    if (resultado?.error) {
      setErrorUI(resultado.error)
      setIsPending(false)
    }
    // Si sale bien, el redirect('/') que tienes en actions.ts hará el resto.
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
      
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bienvenido a Flujent</h2>
      </div>

      {/* Mostramos el error si existe */}
      {errorUI && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {errorUI}
        </div>
      )}

      {/* CLAVE: Usamos 'manejarEnvio' (que es void) y NO 'crearNegocio' directamente */}
      <form action={manejarEnvio} className="space-y-6">
        <input type="hidden" name="tipo_perfil" value={tipoPerfil} />

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del Negocio</label>
            <input name="nombre" type="text" required placeholder="Ej: Canchas Huilo Huilo" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="saldo_actual" type="number" placeholder="Saldo Inicial" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="ingresos_mensuales" type="number" placeholder="Ingresos Est." required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

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