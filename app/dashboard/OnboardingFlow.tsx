'use client'

import { useState } from 'react'
import { crearNegocio } from './actions'
import { Building2, Wallet, TrendingUp, BarChart3 } from 'lucide-react'

export default function OnboardingFlow() {
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const clientAction = async (formData: FormData) => {
    setError(null)
    setCargando(true)
    
    const result = await crearNegocio(formData)
    
    if (result?.error) {
      setError(result.error)
      setCargando(false)
    }
    // Si sale bien, el redirect ocurre en el server action
  }

  const inputStyle = "w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white";
  const labelStyle = "block text-xs font-bold text-slate-500 uppercase mb-2 ml-1";

  return (
    <div className="max-w-xl w-full bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-gray-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
          <Building2 className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Configura tu Negocio</h1>
        <p className="text-slate-500 dark:text-slate-400">Solo tomará un minuto tener tu dashboard listo.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      <form action={clientAction} className="space-y-6">
        <div>
          <label className={labelStyle}>Nombre del Negocio / Proyecto</label>
          <input name="nombre" type="text" placeholder="Ej: Canchas Huilo Huilo" required className={inputStyle} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyle}>Saldo Inicial en Caja</label>
            <input name="saldo_actual" type="number" placeholder="0" required className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Ingresos Mensuales Est.</label>
            <input name="ingresos_mensuales" type="number" placeholder="0" required className={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyle}>Gastos Fijos Mensuales</label>
            <input name="gastos_fijos" type="number" placeholder="0" required className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Gastos Var. Mensuales</label>
            <input name="gastos_variables" type="number" placeholder="0" required className={inputStyle} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {cargando ? "Preparando tu Dashboard..." : "Comenzar ahora"}
        </button>
      </form>
    </div>
  )
}