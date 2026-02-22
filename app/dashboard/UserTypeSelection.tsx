'use client'

import { User, Briefcase } from 'lucide-react'

// Definimos qué recibe este componente (la función para cambiar de paso)
interface Props {
  onSelect: (tipo: 'personal' | 'negocio') => void;
}

export default function UserTypeSelection({ onSelect }: Props) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">¿Cómo usarás Flujent?</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Elige tu perfil para adaptar tu experiencia.</p>
      </div>

      <div className="grid gap-4">
        {/* Opción Personal */}
        <button 
          onClick={() => onSelect('personal')}
          className="w-full flex items-center gap-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
        >
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <User size={28} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Uso Personal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Para ordenar mi sueldo, mis gastos diarios y empezar a ahorrar.</p>
          </div>
        </button>

        {/* Opción Negocio */}
        <button 
          onClick={() => onSelect('negocio')}
          className="w-full flex items-center gap-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all text-left group"
        >
          <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform">
            <Briefcase size={28} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Para mi Negocio / Pyme</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Para controlar la caja, proyectar liquidez y automatizar ingresos.</p>
          </div>
        </button>
      </div>
    </div>
  )
}