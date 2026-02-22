'use client'

import { useState } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'

interface Hito {
  id: string;
  nombre: string;
  monto: number;
}

export default function ProyeccionHitos({ saldoInicial }: { saldoInicial: number }) {
  const [hitos, setHitos] = useState<Hito[]>([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoMonto, setNuevoMonto] = useState('')

  const agregarHito = () => {
    if (!nuevoNombre || !nuevoMonto) return
    const hito: Hito = {
      id: crypto.randomUUID(),
      nombre: nuevoNombre,
      monto: Number(nuevoMonto)
    }
    setHitos([...hitos, hito])
    setNuevoNombre('')
    setNuevoMonto('')
  }

  const totalInversiones = hitos.reduce((acc, h) => acc + h.monto, 0)
  const saldoFinal = saldoInicial - totalInversiones

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hitos de Inversión</h3>
          <p className="text-xs text-slate-500">¿Qué pasa si inviertes hoy?</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Caja Proyectada</p>
          <p className={`text-xl font-black ${saldoFinal >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            ${new Intl.NumberFormat('es-CL').format(saldoFinal)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ej: Nueva Cancha" 
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
        <input 
          type="number" 
          placeholder="Monto" 
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
          className="w-28 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
        <button onClick={agregarHito} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {hitos.map((h) => (
          <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Calendar size={14} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{h.nombre}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-red-500">-${new Intl.NumberFormat('es-CL').format(h.monto)}</span>
              <button onClick={() => setHitos(hitos.filter(x => x.id !== h.id))} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}