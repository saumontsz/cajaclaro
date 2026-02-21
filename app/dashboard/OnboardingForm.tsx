'use client'

import { useState } from 'react'
import { User, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react'
import { crearNegocio } from './actions'

export default function OnboardingForm() {
  const [tipoUso, setTipoUso] = useState<'personal' | 'negocio' | null>(null)

  // Pantalla 1: Selección de perfil
  if (!tipoUso) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Cómo usarás Flujent?</h2>
        <p className="text-center text-gray-500 mb-4 text-sm">Elige tu perfil para adaptar tu experiencia.</p>
        
        <button onClick={() => setTipoUso('personal')} className="p-5 border-2 border-gray-100 hover:border-blue-500 bg-white rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md group text-left">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Uso Personal</h3>
            <p className="text-sm text-gray-500">Para ordenar mi sueldo, mis gastos diarios y empezar a ahorrar.</p>
          </div>
        </button>

        <button onClick={() => setTipoUso('negocio')} className="p-5 border-2 border-gray-100 hover:border-yellow-500 bg-white rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md group text-left">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full group-hover:bg-yellow-500 group-hover:text-white transition-colors">
            <Briefcase size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Para mi Negocio / Pyme</h3>
            <p className="text-sm text-gray-500">Para controlar la caja, proyectar liquidez y automatizar ingresos.</p>
          </div>
        </button>
      </div>
    )
  }

  const esPersonal = tipoUso === 'personal'

  // Pantalla 2: Formulario adaptado al perfil
  return (
    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
      <button 
        type="button" 
        onClick={() => setTipoUso(null)} 
        className="text-sm text-gray-500 mb-4 hover:text-gray-900 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={16} /> Volver
      </button>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {esPersonal ? 'Tus números actuales' : 'Configura tu negocio'}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {esPersonal ? 'Ingresa aproximados, podrás ajustarlo después.' : 'Ingresa la base para empezar a proyectar tu liquidez.'}
      </p>

      <form action={crearNegocio} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {esPersonal ? '¿Cómo llamarás a esta cuenta?' : 'Nombre de tu negocio o proyecto'}
          </label>
          <input name="nombre" type="text" required placeholder={esPersonal ? "Ej: Mis Finanzas" : "Ej: Canchas Huilo Huilo"} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {esPersonal ? '¿Cuánta plata tienes hoy disponible? ($)' : 'Caja Inicial Actual ($)'}
          </label>
          <input name="saldo_actual" type="number" required placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {esPersonal ? '¿Cuál es tu ingreso mensual (Sueldo, etc.)? ($)' : 'Ingresos promedio esperados al mes ($)'}
          </label>
          <input name="ingresos_mensuales" type="number" required placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {esPersonal ? 'Gastos Fijos (Arriendo, Luz) ($)' : 'Gastos Fijos Base ($)'}
            </label>
            <input name="gastos_fijos" type="number" required placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {esPersonal ? 'Gastos Extras / Salidas ($)' : 'Gastos Variables Base ($)'}
            </label>
            <input name="gastos_variables" type="number" required placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
          </div>
        </div>
        
        <button type="submit" className={`w-full mt-2 px-4 py-3.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${
          esPersonal ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30' : 'bg-gray-900 hover:bg-gray-800'
        }`}>
          Finalizar y Entrar <ArrowRight size={18} />
        </button>
      </form>
    </div>
  )
}