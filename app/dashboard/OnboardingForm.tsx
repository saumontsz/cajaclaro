'use client'

import { crearNegocio } from './actions'
import { Building2, Wallet, TrendingUp, Receipt, ArrowRight, ChevronLeft } from 'lucide-react'

// 1. Le decimos a TypeScript qué datos esperar
interface Props {
  tipoPerfil: 'personal' | 'negocio';
  onBack: () => void;
}

// 2. Extraemos las variables tipoPerfil y onBack
export default function OnboardingForm({ tipoPerfil, onBack }: Props) {
  const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      {/* 3. Conectamos la función onBack al botón */}
      <button 
        type="button" 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Volver</span>
      </button>

      <div className="mb-8">
        {/* Un pequeño detalle dinámico según lo que eligió */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {tipoPerfil === 'negocio' ? 'Datos de tu Negocio' : 'Tus Finanzas Personales'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Ingresa aproximados, podrás ajustarlo después.</p>
      </div>

      <form action={crearNegocio} className="space-y-6">
        {/* Nombre de la cuenta */}
        <div>
          <label className={labelClasses}>
            {tipoPerfil === 'negocio' ? '¿Cómo se llama tu negocio o proyecto?' : '¿Cómo llamarás a esta cuenta?'}
          </label>
          <input 
            name="nombre" 
            type="text" 
            required 
            placeholder={tipoPerfil === 'negocio' ? "Ej: Canchas Huilo Huilo" : "Ej: Finanzas Personales"} 
            className={inputClasses} 
          />
        </div>

        {/* Plata disponible */}
        <div>
          <label className={labelClasses}>¿Cuánta plata tienes hoy disponible? ($)</label>
          <input name="saldo_actual" type="number" required placeholder="0" className={inputClasses} />
        </div>

        {/* Ingreso Mensual */}
        <div>
          <label className={labelClasses}>¿Cuál es tu ingreso mensual (Sueldo, Ventas, etc.)? ($)</label>
          <input name="ingresos_mensuales" type="number" required placeholder="0" className={inputClasses} />
        </div>

        {/* Gastos Fijos y Extras */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Gastos Fijos ($)</label>
            <input name="gastos_fijos" type="number" required placeholder="Arriendo, Luz..." className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Gastos Extras ($)</label>
            <input name="gastos_variables" type="number" required placeholder="Salidas, Otros..." className={inputClasses} />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          Finalizar y Entrar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  )
}