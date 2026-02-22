'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'
// ... otros imports

export default function OnboardingFlow() {
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  // 1. Creamos un "handler" que TypeScript acepte
  const manejarAccion = async (formData: FormData) => {
    // Limpiamos errores previos
    setMensajeError(null)

    // Llamamos a la acción real
    const resultado = await crearNegocio(formData)

    // Si la acción nos devuelve un error, lo guardamos en el estado
    if (resultado?.error) {
      setMensajeError(resultado.error)
    }
    // Si no hay error, Next.js se encargará del redirect/revalidate automático
  }

  return (
    <div className="max-w-md w-full">
      {/* 2. Mostramos el error si existe */}
      {mensajeError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {mensajeError}
        </div>
      )}

      {/* 3. Cambiamos la acción por nuestra nueva función */}
      <form action={manejarAccion} className="space-y-6">
        {/* ... tus campos de formulario ... */}
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">
          Finalizar Configuración
        </button>
      </form>
    </div>
  )
}