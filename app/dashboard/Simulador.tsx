'use client'

import { useState, useMemo } from 'react'
import { TrendingDown, AlertTriangle, ShieldCheck, HelpCircle, Activity } from 'lucide-react'

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
  // Iniciamos con un 20% de caída por defecto para incitar a la prueba
  const [porcentajeCaida, setPorcentajeCaida] = useState(20)

  // Usamos useMemo para que el cálculo sea eficiente y reactivo
  const analisis = useMemo(() => {
    const gastosTotales = (negocio.gastos_fijos || 0) + (negocio.gastos_variables || 0);
    
    // 1. Calculamos el nuevo ingreso hipotético
    const nuevosIngresos = negocio.ingresos_mensuales * (1 - (porcentajeCaida / 100));
    
    // 2. Calculamos el flujo neto (Entrada - Salida)
    const flujoNeto = nuevosIngresos - gastosTotales;

    // ESCENARIO A: SUPERÁVIT (Aún ganamos dinero o quedamos tablas)
    if (flujoNeto >= 0) {
      return {
        meses: 'Indefinido',
        estado: 'safe', // Verde
        mensaje: 'Tu negocio es resiliente.',
        detalle: `Aún con una caída del ${porcentajeCaida}%, seguirías generando utilidades (o equilibrio) por $${formatoCLP(flujoNeto)}.`,
        consejo: 'Estás en una posición sólida. Es un buen momento para planear reinversiones.'
      };
    }

    // ESCENARIO B: DÉFICIT (Perdemos dinero)
    const deficitMensual = Math.abs(flujoNeto);
    
    // Evitamos división por cero si el saldo es 0
    const mesesVida = negocio.saldo_actual > 0 
      ? (negocio.saldo_actual / deficitMensual).toFixed(1) 
      : "0.0";

    const esCritico = Number(mesesVida) < 3;

    return {
      meses: `${mesesVida} meses`,
      estado: esCritico ? 'critical' : 'warning', // Rojo o Amarillo
      mensaje: `Entrarías en déficit de $${formatoCLP(deficitMensual)} al mes.`,
      detalle: `Con tu caja actual ($${formatoCLP(negocio.saldo_actual)}), podrías cubrir este hueco durante ${mesesVida} meses antes de quedarte en cero.`,
      consejo: esCritico 
        ? '¡ACCIÓN INMEDIATA! Tu supervivencia corre peligro. Reduce gastos fijos urgentemente.' 
        : 'Prepara un plan de contingencia. Revisa tus costos variables para ganar más tiempo.'
    };

  }, [negocio, porcentajeCaida]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm mt-8 transition-colors">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl">
           <Activity className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Simulador de Riesgo</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Ajusta el porcentaje para ver cuánto tiempo resistiría tu caja.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* SLIDER */}
        <div>
          <div className="flex justify-between text-sm font-medium mb-4 text-gray-600 dark:text-slate-300">
            <span>Si tus ingresos caen un...</span>
            <span className="text-gray-900 dark:text-white font-black text-2xl">{porcentajeCaida}%</span>
          </div>
          
          <div className="relative w-full h-6 flex items-center">
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={porcentajeCaida}
              onChange={(e) => setPorcentajeCaida(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 z-10"
            />
          </div>
          
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">
            <span>Escenario Actual (0%)</span>
            <span>Catástrofe (100%)</span>
          </div>
        </div>

        {/* TARJETA DE RESULTADOS DINÁMICA */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          analisis.estado === 'safe' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-500/20' 
            : analisis.estado === 'warning' 
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-500/20' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-500/20'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              {analisis.estado === 'safe' 
                ? <ShieldCheck className="text-green-600 dark:text-green-400" size={24} /> 
                : <AlertTriangle className={analisis.estado === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'} size={24} />
              }
              <div>
                <span className={`block text-xs font-bold uppercase mb-0.5 ${
                  analisis.estado === 'safe' ? 'text-green-600 dark:text-green-400' : 
                  analisis.estado === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>
                  Cobertura estimada
                </span>
                <span className={`font-black text-2xl ${
                   analisis.estado === 'safe' ? 'text-green-800 dark:text-green-200' : 
                   analisis.estado === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 
                   'text-red-800 dark:text-red-200'
                }`}>
                  {analisis.meses}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-800 dark:text-slate-200 text-sm mb-2 font-bold">
            {analisis.mensaje}
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-xs mb-5 leading-relaxed">
            {analisis.detalle}
          </p>

          {/* SECCIÓN DE CONSEJO */}
          <div className="bg-white dark:bg-slate-950/50 p-4 rounded-xl flex gap-3 items-start border border-gray-100 dark:border-slate-800">
            <HelpCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Consejo Inteligente</span>
              <p className="text-sm text-gray-700 dark:text-slate-300 font-medium leading-snug">
                {analisis.consejo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}