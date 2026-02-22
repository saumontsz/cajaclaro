'use client' // Importante: esto debe ser un Client Component

import { useState } from 'react'
import { crearNegocio } from './actions'

export default function OnboardingFlow({ tipoPerfil }: { tipoPerfil: string }) {
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  // 1. Creamos esta función envoltorio (Wrapper)
  // Esta función devuelve 'void', cumpliendo con lo que pide el <form>
  const manejarAccion = async (formData: FormData) => {
    setMensajeError(null) // Limpiamos errores previos

    const resultado = await crearNegocio(formData)

    // Si la acción devuelve un error, lo guardamos para mostrarlo en el UI
    if (resultado?.error) {
      setMensajeError(resultado.error)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* 2. Mostramos el error si existe */}
      {mensajeError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {mensajeError}
        </div>
      )}

      {/* 3. ¡LA SOLUCIÓN! Usamos 'manejarAccion' en lugar de 'crearNegocio' directamente */}
      <form action={manejarAccion} className="space-y-6">
        <input type="hidden" name="tipo_perfil" value={tipoPerfil} />
        
        {/* Tus otros inputs del formulario aquí... */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Nombre del Negocio
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg transition-all active:scale-95"
        >
          Finalizar Configuración
        </button>
      </form>
    </div>
  )
}