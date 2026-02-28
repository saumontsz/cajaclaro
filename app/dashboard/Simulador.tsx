'use client'

import { useState, useMemo } from 'react'
import { 
  AlertTriangle, ShieldCheck, Activity, BrainCircuit, 
  TrendingDown, DollarSign, Sparkles 
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface Transaccion {
  monto: number;
  tipo: string;
  created_at: string;
  categoria?: string;
}

interface Props {
  negocio: {
    saldo_actual: number;
    ingresos_mensuales: number; 
    gastos_fijos: number;
    gastos_variables: number;
    nombre: string;
  };
  transacciones: Transaccion[];
}

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

// 🚀 Formateador inteligente para el Eje Y
const formatYAxis = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

export default function Simulador({ negocio, transacciones }: Props) {
  const [porcentajeCaida, setPorcentajeCaida] = useState(20)

  const datosInteligentes = useMemo(() => {
    const ahora = new Date();
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(ahora.getMonth() - 6);

    const txRecientes = transacciones.filter(t => new Date(t.created_at) >= seisMesesAtras);

    if (txRecientes.length < 2) {
      return {
        ingresoPromedio: negocio.ingresos_mensuales || 0,
        gastoFijoPromedio: negocio.gastos_fijos || 0,
        gastoVariablePromedio: negocio.gastos_variables || 0,
      };
    }

    let totalIngresos = 0;
    let sumaGastosFijosManual = 0;
    let sumaGastosVariablesManual = 0;
    let sumaGastosSinClasificar = 0;
    let fechaMasAntigua = ahora.getTime();

    const CATEGORIAS_FIJAS = ['arriendo', 'sueldo', 'software', 'internet', 'seguro', 'servicios básicos', 'oficina', 'suscrip'];
    const CATEGORIAS_VARIABLES = ['marketing', 'publicidad', 'proveedor', 'comision', 'impuesto', 'mantenimiento', 'materia prima', 'logistica', 'envio'];

    txRecientes.forEach(tx => {
      const fechaTx = new Date(tx.created_at).getTime();
      if (fechaTx < fechaMasAntigua) fechaMasAntigua = fechaTx;
      const monto = Number(tx.monto);
      const cat = (tx.categoria || '').toLowerCase();

      if (tx.tipo === 'ingreso') {
        totalIngresos += monto;
      } else {
        const esFijo = CATEGORIAS_FIJAS.some(f => cat.includes(f));
        const esVariable = CATEGORIAS_VARIABLES.some(v => cat.includes(v));
        if (esFijo) sumaGastosFijosManual += monto;
        else if (esVariable) sumaGastosVariablesManual += monto;
        else sumaGastosSinClasificar += monto;
      }
    });

    const msPorMes = 1000 * 60 * 60 * 24 * 30.44;
    const mesesParaPromedio = Math.min(6, Math.max(1, (ahora.getTime() - fechaMasAntigua) / msPorMes));

    const totalG_Clasificados = sumaGastosFijosManual + sumaGastosVariablesManual;
    const ratioFijoReal = sumaGastosFijosManual / (totalG_Clasificados || 1);
    const gastoTotalPromedio = (totalG_Clasificados + sumaGastosSinClasificar) / mesesParaPromedio;

    return {
      ingresoPromedio: totalIngresos / mesesParaPromedio,
      gastoFijoPromedio: gastoTotalPromedio * ratioFijoReal,
      gastoVariablePromedio: gastoTotalPromedio * (1 - ratioFijoReal),
    };
  }, [transacciones, negocio]);

  const analisis = useMemo(() => {
    const { ingresoPromedio, gastoFijoPromedio, gastoVariablePromedio } = datosInteligentes;
    const multiplicadorVentas = 1 - (porcentajeCaida / 100);
    
    const nuevosIngresos = ingresoPromedio * multiplicadorVentas;
    const nuevosGastosVariables = gastoVariablePromedio * multiplicadorVentas;
    const nuevoGastoTotal = gastoFijoPromedio + nuevosGastosVariables;
    const flujoNeto = nuevosIngresos - nuevoGastoTotal;

    const esSafe = flujoNeto >= 0;
    const deficitMensual = Math.abs(flujoNeto);
    const mesesVida = negocio.saldo_actual > 0 ? (negocio.saldo_actual / deficitMensual).toFixed(1) : "0.0";
    const esCritico = Number(mesesVida) < 3 && !esSafe;

    const chartData = [
      {
        name: 'Actualidad',
        Ingresos: Math.round(ingresoPromedio),
        'G. Variables': Math.round(gastoVariablePromedio),
        'G. Fijos': Math.round(gastoFijoPromedio),
      },
      {
        name: `Estrés (-${porcentajeCaida}%)`,
        Ingresos: Math.round(nuevosIngresos),
        'G. Variables': Math.round(nuevosGastosVariables),
        'G. Fijos': Math.round(gastoFijoPromedio),
      }
    ];

    return {
      flujoNeto,
      chartData,
      meses: esSafe ? 'Indefinido' : `${mesesVida} meses`,
      estado: esSafe ? 'safe' : esCritico ? 'critical' : 'warning',
      mensaje: esSafe ? 'Estructura robusta.' : `Déficit de -$${formatoCLP(deficitMensual)}/mes.`,
      detalle: esSafe 
        ? `Incluso con una caída del ${porcentajeCaida}%, tu flujo sigue positivo (+ $${formatoCLP(flujoNeto)}).`
        : `Tus ingresos no cubren los gastos fijos. Tienes ${mesesVida} meses de oxígeno con tu saldo actual.`,
    };
  }, [datosInteligentes, porcentajeCaida, negocio.saldo_actual]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-8 text-xs font-bold">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="text-slate-900 dark:text-white">${formatoCLP(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-slate-800/60 shadow-sm mt-8 transition-all">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
          <BrainCircuit className="text-purple-600 dark:text-purple-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Simulador de Estrés IA
            <Sparkles size={16} className="text-purple-400 animate-pulse" />
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Predicción de supervivencia ante crisis de mercado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caída de Ventas</span>
              <span className="text-purple-600 dark:text-purple-400 font-black text-4xl">-{porcentajeCaida}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" value={porcentajeCaida}
              onChange={(e) => setPorcentajeCaida(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-4"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase">
              <span>Actual</span>
              <span>Crisis Total</span>
            </div>
          </div>

          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${
            analisis.estado === 'safe' ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 
            'bg-rose-50/30 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              {analisis.estado === 'safe' ? <ShieldCheck className="text-emerald-500" size={32} /> : <AlertTriangle className="text-rose-500" size={32} />}
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervivencia (Runway)</span>
                <span className={`text-3xl font-black ${analisis.estado === 'safe' ? 'text-emerald-600' : 'text-rose-600'}`}>{analisis.meses}</span>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-bold mb-2">{analisis.mensaje}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{analisis.detalle}</p>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> Proyección de Flujo
            </h4>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${analisis.flujoNeto >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              Neto: {analisis.flujoNeto >= 0 ? '+' : '-'}${formatoCLP(Math.abs(analisis.flujoNeto))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* 🛠️ AJUSTE: Aumentamos el margen izquierdo para etiquetas largas */}
              <BarChart data={analisis.chartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }} barGap={12}>
                <defs>
                  <linearGradient id="gradSafe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                  <linearGradient id="gradVar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
                  <linearGradient id="gradFix" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#94a3b8" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} dy={10} />
                
                {/* 🛠️ AJUSTE: Definimos ancho fijo y formateador inteligente */}
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                  width={65} 
                  tickFormatter={formatYAxis} 
                />
                
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                <Legend verticalAlign="top" align="right" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                
                <Bar dataKey="Ingresos" fill="url(#gradSafe)" radius={[8, 8, 0, 0]} maxBarSize={45} />
                <Bar dataKey="G. Variables" stackId="g" fill="url(#gradVar)" maxBarSize={45} />
                <Bar dataKey="G. Fijos" stackId="g" fill="url(#gradFix)" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}