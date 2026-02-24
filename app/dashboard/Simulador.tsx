'use client'

import { useState, useMemo } from 'react'
import { TrendingDown, AlertTriangle, ShieldCheck, HelpCircle, Activity, BrainCircuit } from 'lucide-react'

// Definimos la estructura de la transacción que viene de la base de datos
interface Transaccion {
  monto: number;
  tipo: string;
  created_at: string;
}

interface Props {
  negocio: {
    saldo_actual: number;
    // Mantenemos estos por si no hay historial suficiente (fallback)
    ingresos_mensuales: number; 
    gastos_fijos: number;
    gastos_variables: number;
  };
  transacciones: Transaccion[]; // <--- AHORA RECIBIMOS EL HISTORIAL
}

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

export default function Simulador({ negocio, transacciones }: Props) {
  const [porcentajeCaida, setPorcentajeCaida] = useState(20)

  // --- LÓGICA INTELIGENTE: PROCESAMIENTO DE HISTORIAL ---
  const datosInteligentes = useMemo(() => {
    const ahora = new Date();
    // Filtramos solo los últimos 6 meses para que el dato sea fresco
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(ahora.getMonth() - 6);

    const txRecientes = transacciones.filter(t => new Date(t.created_at) >= seisMesesAtras);

    // Si no hay datos suficientes (menos de 2 movimientos), usamos el perfil estático
    if (txRecientes.length < 2) {
      return {
        ingresoPromedio: negocio.ingresos_mensuales || 0,
        gastoPromedio: (negocio.gastos_fijos || 0) + (negocio.gastos_variables || 0),
        esBasadoEnHistorial: false
      };
    }

    // Agrupamos por mes (clave: "2023-10")
    const ingresosPorMes: Record<string, number> = {};
    const gastosPorMes: Record<string, number> = {};
    const mesesUnicos = new Set<string>();

    txRecientes.forEach(tx => {
      const fecha = new Date(tx.created_at);
      const claveMes = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      mesesUnicos.add(claveMes);

      if (tx.tipo === 'ingreso') {
        ingresosPorMes[claveMes] = (ingresosPorMes[claveMes] || 0) + Number(tx.monto);
      } else {
        gastosPorMes[claveMes] = (gastosPorMes[claveMes] || 0) + Number(tx.monto);
      }
    });

    const cantidadMeses = mesesUnicos.size || 1; // Evitar división por cero

    // Calculamos promedios reales
    const totalIngresos = Object.values(ingresosPorMes).reduce((a, b) => a + b, 0);
    const totalGastos = Object.values(gastosPorMes).reduce((a, b) => a + b, 0);

    return {
      ingresoPromedio: totalIngresos / cantidadMeses,
      gastoPromedio: totalGastos / cantidadMeses,
      esBasadoEnHistorial: true,
      mesesAnalizados: cantidadMeses
    };
  }, [transacciones, negocio]);


  // --- SIMULACIÓN SOBRE LOS DATOS INTELIGENTES ---
  const analisis = useMemo(() => {
    const { ingresoPromedio, gastoPromedio } = datosInteligentes;
    
    // Aplicamos la caída al PROMEDIO REAL
    const nuevosIngresos = ingresoPromedio * (1 - (porcentajeCaida / 100));
    const flujoNeto = nuevosIngresos - gastoPromedio;

    // Escenario A: Superávit
    if (flujoNeto >= 0) {
      return {
        meses: 'Indefinido',
        estado: 'safe',
        mensaje: 'Tu estructura de costos es ligera.',
        detalle: `Tu promedio real de gastos es bajo ($${formatoCLP(gastoPromedio)}). Incluso vendiendo un ${porcentajeCaida}% menos, sigues en verde.`,
        consejo: 'Excelente resistencia. Considera invertir el excedente para crecer más rápido.'
      };
    }

    // Escenario B: Déficit
    const deficitMensual = Math.abs(flujoNeto);
    const mesesVida = negocio.saldo_actual > 0 
      ? (negocio.saldo_actual / deficitMensual).toFixed(1) 
      : "0.0";
    
    const esCritico = Number(mesesVida) < 3;

    return {
      meses: `${mesesVida} meses`,
      estado: esCritico ? 'critical' : 'warning',
      mensaje: `Quemarías caja a ritmo de $${formatoCLP(deficitMensual)}/mes.`,
      detalle: `Basado en tu comportamiento real de los últimos meses, tu saldo actual ($${formatoCLP(negocio.saldo_actual)}) te da ${mesesVida} meses de oxígeno.`,
      consejo: esCritico 
        ? 'ALERTA ROJA: Tus gastos fijos reales son muy altos para este escenario. Corta costos no esenciales hoy mismo.' 
        : 'PRECAUCIÓN: Tienes tiempo, pero no te confíes. Empieza a renegociar con proveedores o busca nuevas fuentes de ingreso.'
    };

  }, [datosInteligentes, porcentajeCaida, negocio.saldo_actual]);


  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm mt-8 transition-colors">
      
      {/* HEADER CON INDICADOR DE INTELIGENCIA */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl">
            <BrainCircuit className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Simulador IA</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Proyección basada en tu historial real.
            </p>
          </div>
        </div>
        {datosInteligentes.esBasadoEnHistorial && (
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
            Analizando {datosInteligentes.mesesAnalizados} meses
          </span>
        )}
      </div>

      <div className="space-y-8">
        {/* SLIDER */}
        <div>
          <div className="flex justify-between text-sm font-medium mb-4 text-gray-600 dark:text-slate-300">
            <span>Si tus ingresos promedio caen un...</span>
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
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500 z-10"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider">
            <span>Actualidad</span>
            <span>Crisis Total</span>
          </div>
        </div>

        {/* TARJETA DE RESULTADOS */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          analisis.estado === 'safe' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-500/20' 
            : analisis.estado === 'warning' 
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-500/20' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {analisis.estado === 'safe' 
              ? <ShieldCheck className="text-green-600 dark:text-green-400" size={24} /> 
              : <AlertTriangle className={analisis.estado === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'} size={24} />
            }
            <div>
              <span className={`block text-xs font-bold uppercase ${
                  analisis.estado === 'safe' ? 'text-green-600 dark:text-green-400' : 
                  analisis.estado === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
              }`}>Runway Estimado</span>
              <span className={`font-black text-2xl ${
                  analisis.estado === 'safe' ? 'text-green-800 dark:text-green-200' : 
                  analisis.estado === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 
                  'text-red-800 dark:text-red-200'
              }`}>{analisis.meses}</span>
            </div>
          </div>
          
          <p className="text-gray-800 dark:text-slate-200 text-sm mb-2 font-bold">{analisis.mensaje}</p>
          <p className="text-gray-600 dark:text-slate-400 text-xs mb-5 leading-relaxed">{analisis.detalle}</p>

          <div className="bg-white dark:bg-slate-950/50 p-4 rounded-xl flex gap-3 items-start border border-gray-100 dark:border-slate-800">
            <Activity size={18} className="text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Estrategia Recomendada</span>
              <p className="text-sm text-gray-700 dark:text-slate-300 font-medium leading-snug">{analisis.consejo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}