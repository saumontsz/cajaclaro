'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

interface Props {
  negocio: {
    saldo_actual: number;
    ingresos_mensuales: number;
    gastos_fijos: number;
    gastos_variables: number;
  }
}

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

export default function Simulador({ negocio }: Props) {
  const [caida, setCaida] = useState(0)
  
  const ingresosSimulados = negocio.ingresos_mensuales * (1 - (caida / 100))
  const gastosTotales = negocio.gastos_fijos + negocio.gastos_variables
  const flujoNetoSimulado = ingresosSimulados - gastosTotales
  
  const mesesCobertura = flujoNetoSimulado < 0 
    ? Math.abs(negocio.saldo_actual / flujoNetoSimulado)
    : Infinity

  return (
    // Tarjeta principal oscura
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mt-8 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-blue-600 dark:text-blue-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simulador de Riesgo</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        ¿Qué pasa si tienes un mal mes o tus ingresos caen? Ajusta el porcentaje para ver cuánto tiempo de cobertura te queda.
      </p>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-gray-700 dark:text-slate-300">Caída en ingresos</span>
          <span className="text-red-600 dark:text-red-400">-{caida}%</span>
        </div>
        {/* Slider con fondo oscuro */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="5"
          value={caida}
          onChange={(e) => setCaida(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 dark:accent-red-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Cajitas de resultados oscuras */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 transition-colors">
          <span className="block text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider mb-1">Nuevos Ingresos</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">${formatoCLP(ingresosSimulados)}</span>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 transition-colors">
          <span className="block text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider mb-1">Flujo Neto</span>
          <span className={`text-xl font-bold ${flujoNetoSimulado < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-500'}`}>
            {flujoNetoSimulado > 0 ? '+$' : (flujoNetoSimulado < 0 ? '-$' : '$')}{formatoCLP(Math.abs(flujoNetoSimulado))}
          </span>
        </div>
      </div>

      {flujoNetoSimulado < 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 transition-colors">
          <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Tiempo de cobertura: {mesesCobertura === Infinity ? 'Ilimitado' : mesesCobertura.toFixed(1)} meses</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              A este ritmo, tu caja actual se vaciará en menos de {Math.ceil(mesesCobertura)} meses.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}