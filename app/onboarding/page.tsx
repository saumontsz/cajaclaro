'use client'

import { useState } from 'react'
import { crearPrimerNegocio } from './actions'
import { User, Building2, ArrowRight, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState('personal')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    // Agregamos manualmente el tipo seleccionado al FormData
    formData.append('tipo', tipoSeleccionado)

    const resultado = await crearPrimerNegocio(formData)
    
    if (resultado?.error) {
      alert('Error: ' + resultado.error) // Así sabrás por qué se pega
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">¡Bienvenido a Flujent!</h1>
          <p className="text-slate-500 text-sm">Configuremos tu espacio de trabajo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nombre del Espacio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Nombre de tu espacio
            </label>
            <input 
              name="nombre" 
              type="text" 
              required 
              placeholder="Ej. Finanzas de Juan o Empresa SpA"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setTipoSeleccionado('personal')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tipoSeleccionado === 'personal' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <User size={24} className={tipoSeleccionado === 'personal' ? 'text-blue-500' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${tipoSeleccionado === 'personal' ? 'text-blue-700' : 'text-slate-500'}`}>Personal</span>
            </div>

            <div 
              onClick={() => setTipoSeleccionado('empresa')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tipoSeleccionado === 'empresa' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Building2 size={24} className={tipoSeleccionado === 'empresa' ? 'text-blue-500' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${tipoSeleccionado === 'empresa' ? 'text-blue-700' : 'text-slate-500'}`}>Empresa</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Comenzar <ArrowRight size={18} /></>}
          </button>

        </form>
      </div>
    </div>
  )
}