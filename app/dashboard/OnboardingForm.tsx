'use client'

import { useState } from 'react'
import { crearNegocio, cerrarSesion } from './actions' // Importamos cerrarSesion
import { AlertCircle, Building2, User, CheckCircle2, LogOut } from 'lucide-react'

export default function OnboardingForm() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'personal' | 'empresa'>('personal')
  const [errorUI, setErrorUI] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const manejarEnvio = async (formData: FormData) => {
    setErrorUI(null)
    setIsPending(true)

    try {
      const resultado = await crearNegocio(formData)

      if (resultado?.error) {
        setErrorUI(resultado.error)
        setIsPending(false)
      }
      // Si no hay error, la acción del servidor debería redirigir automáticamente
    } catch (e) {
      setErrorUI("Ocurrió un error inesperado. Inténtalo de nuevo.")
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">¡Bienvenido a Flujent!</h2>
          <p className="text-slate-500 text-sm mt-1">Configuremos tu espacio de trabajo.</p>
        </div>

        {errorUI && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} />
            {errorUI}
          </div>
        )}

        <form action={manejarEnvio} className="space-y-6">
          
          {/* 1. SELECCIÓN DE TIPO */}
          <div className="grid grid-cols-2 gap-3 relative">
            <button
              type="button"
              onClick={() => setTipoSeleccionado('personal')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                tipoSeleccionado === 'personal' 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500'
              }`}
            >
              <User size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Personal</span>
              {tipoSeleccionado === 'personal' && <div className="absolute top-2 right-2 text-blue-600"><CheckCircle2 size={14}/></div>}
            </button>

            <button
              type="button"
              onClick={() => setTipoSeleccionado('empresa')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                tipoSeleccionado === 'empresa' 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500'
              }`}
            >
              <Building2 size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Empresa</span>
              {tipoSeleccionado === 'empresa' && <div className="absolute top-2 right-2 text-blue-600"><CheckCircle2 size={14}/></div>}
            </button>
          </div>

          <input type="hidden" name="tipo_perfil" value={tipoSeleccionado} />

          {/* 2. CAMPOS DEL FORMULARIO */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                Nombre del {tipoSeleccionado === 'empresa' ? 'Negocio' : 'Espacio'}
              </label>
              <input 
                name="nombre" 
                type="text" 
                required 
                placeholder={tipoSeleccionado === 'empresa' ? "Ej: Empresa SpA" : "Ej: Mis Finanzas"}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Saldo Inicial</label>
                <input name="saldo_actual" type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Ingresos Est.</label>
                <input name="ingresos_mensuales" type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {isPending ? "Creando espacio..." : "Comenzar"}
          </button>
        </form>
      </div>

      {/* BOTÓN DE SALIDA DE EMERGENCIA */}
      <div className="text-center">
        <form action={cerrarSesion}>
          <button 
            type="submit" 
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut size={14} /> Cerrar Sesión y salir
          </button>
        </form>
      </div>
    </div>
  )
}