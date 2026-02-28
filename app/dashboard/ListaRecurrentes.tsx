'use client'

import { useState } from 'react'
import { toggleRecurrente, eliminarRecurrente } from './actions'
import { Repeat, Play, Pause, Trash2, CalendarClock, DollarSign, Loader2 } from 'lucide-react'

// Interfaz para tipar los datos que recibiremos de la base de datos
interface Recurrente {
  id: string;
  descripcion: string;
  monto: number;
  tipo: string;
  frecuencia: string;
  proxima_ejecucion: string;
  estado: string;
}

export default function ListaRecurrentes({ recurrentes }: { recurrentes: Recurrente[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, estadoActual: string) => {
    setLoadingId(id);
    await toggleRecurrente(id, estadoActual);
    setLoadingId(null);
  };

const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta automatización? No se generarán más movimientos, pero el historial de pagos se mantendrá intacto.")) {
      setLoadingId(id);
      const respuesta = await eliminarRecurrente(id);
      
      // Si el servidor devuelve un error, lo mostramos en pantalla
      if (respuesta?.error) {
        alert("Hubo un error al eliminar: " + respuesta.error);
      }
      
      setLoadingId(null);
    }
  };

  if (recurrentes.length === 0) {
    return null; // Si no hay recurrentes, no mostramos nada para mantener limpio el dashboard
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Repeat className="text-indigo-600 dark:text-indigo-400" size={20} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Suscripciones y Recurrentes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurrentes.map((item) => (
          <div 
            key={item.id} 
            className={`p-4 rounded-2xl border transition-all ${
              item.estado === 'activo' 
                ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50' 
                : 'bg-gray-100 dark:bg-slate-800/20 border-gray-200 border-dashed dark:border-slate-700 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {item.descripcion}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 capitalize flex items-center gap-1 mt-1">
                  <CalendarClock size={12} /> Se repite de forma {item.frecuencia}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                item.tipo === 'ingreso' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.tipo === 'ingreso' ? '+' : '-'}${new Intl.NumberFormat('es-CL').format(item.monto)}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/50">
              <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                Próximo: {new Date(item.proxima_ejecucion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggle(item.id, item.estado)}
                  disabled={loadingId === item.id}
                  className={`p-2 rounded-lg transition-colors ${
                    item.estado === 'activo' 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  }`}
                  title={item.estado === 'activo' ? 'Pausar' : 'Reactivar'}
                >
                  {loadingId === item.id ? <Loader2 size={16} className="animate-spin" /> : (item.estado === 'activo' ? <Pause size={16} /> : <Play size={16} />)}
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  disabled={loadingId === item.id}
                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  {loadingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}