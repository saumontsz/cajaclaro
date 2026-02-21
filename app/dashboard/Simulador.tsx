'use client'

import { useState } from 'react'
import { Activity, Percent, Calendar, Wallet, TrendingDown } from 'lucide-react'

// Definimos la forma de los datos que recibimos
interface Props {
  negocio: {
    saldo_actual: number
    ingresos_mensuales: number
    gastos_fijos: number
    gastos_variables: number
  }
}

export default function Simulador({ negocio }: Props) {
  const [simular, setSimular] = useState(false)

  // Si estamos simulando, bajamos los ingresos un 20%
  const ingresos = simular ? negocio.ingresos_mensuales * 0.8 : negocio.ingresos_mensuales
  const gastosTotales = negocio.gastos_fijos + negocio.gastos_variables
  
  // Recalculamos todo con el nuevo ingreso
  const flujoMensual = ingresos - gastosTotales
  const margen = ingresos > 0 ? Math.round((flujoMensual / ingresos) * 100) : 0
  const gastoDiario = gastosTotales / 30
  const diasSupervivencia = gastoDiario > 0 ? Math.round(negocio.saldo_actual / gastoDiario) : 9999
  const proyeccion90Dias = negocio.saldo_actual + (flujoMensual * 3)

  const colorSupervivencia = diasSupervivencia < 30 ? 'text-red-600' : diasSupervivencia < 90 ? 'text-yellow-600' : 'text-gray-900'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Simulador de Escenarios</h2>
          <p className="text-sm text-gray-500">¿Qué pasa si las ventas caen este mes?</p>
        </div>
        
        {/* Botón (Toggle) para activar/desactivar la simulación */}
        <button
          onClick={() => setSimular(!simular)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            simular 
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <TrendingDown size={16} />
          {simular ? 'Desactivar simulación' : 'Simular caída del 20%'}
        </button>
      </div>

      {/* Mostramos los resultados solo si la simulación está activa para no ser redundantes */}
      {simular ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">Nuevo Flujo</span>
            <p className={`text-xl font-bold mt-1 ${flujoMensual < 0 ? 'text-red-600' : 'text-gray-900'}`}>${flujoMensual}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">Nuevo Margen</span>
            <p className={`text-xl font-bold mt-1 ${margen < 0 ? 'text-red-600' : 'text-gray-900'}`}>{margen}%</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">Días de Vida</span>
            <p className={`text-xl font-bold mt-1 ${colorSupervivencia}`}>{diasSupervivencia}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">Caja a 90 Días</span>
            <p className={`text-xl font-bold mt-1 ${proyeccion90Dias < 0 ? 'text-red-600' : 'text-gray-900'}`}>${proyeccion90Dias}</p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
          Activa el simulador para ver el impacto de una caída del 20% en tus ingresos sobre la liquidez de tu negocio.
        </div>
      )}
    </div>
  )
}