'use client'

import { useState } from 'react'
import { crearNegocio, cerrarSesion } from './actions'
import { AlertCircle, Building2, User, CheckCircle2, LogOut } from 'lucide-react'

export default function OnboardingForm() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'personal' | 'empresa'>('personal')
  const [errorUI, setErrorUI] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // Estado para los valores formateados (lo que ve el usuario)
  const [valores, setValores] = useState({
    saldo_actual: '',
    ingresos_mensuales: ''
  })

  // Función para formatear: 1000000 -> 1.000.000
  const formatearMiles = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '')
    if (!soloNumeros) return ''
    return new Intl.NumberFormat('es-CL').format(Number(soloNumeros))
  }

  // Función para limpiar: 1.000.000 -> 1000000
  const limpiarPuntos = (valor: string) => valor.replace(/\./g, '')

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValores(prev => ({
      ...prev,
      [name]: formatearMiles(value)
    }))
  }

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorUI(null)
    setIsPending(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // REEMPLAZO CRÍTICO: Limpiamos los puntos antes de enviar al Action
    formData.set('saldo_actual', limpiarPuntos(valores.saldo_actual))
    formData.set('ingresos_mensuales', limpiarPuntos(valores.ingresos_mensuales))

    try {
      const resultado = await crearNegocio(formData)
      if (resultado?.error) {
        setErrorUI(resultado.error)
        setIsPending(false)
      }
    } catch (err) {
      setErrorUI("Ocurrió un error inesperado.")
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

        <form onSubmit={manejarEnvio} className="space-y-6">
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
                <input 
                  name="saldo_actual" 
                  type="text" 
                  inputMode="numeric"
                  value={valores.saldo_actual}
                  onChange={manejarCambio}
                  placeholder="0" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Ingresos Est.</label>
                <input 
                  name="ingresos_mensuales" 
                  type="text" 
                  inputMode="numeric"
                  value={valores.ingresos_mensuales}
                  onChange={manejarCambio}
                  placeholder="0" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {isPending ? "Creando espacio..." : "Comenzar"}
          </button>
        </form>
      </div>

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