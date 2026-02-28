'use client'

import { useMemo } from 'react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts'
import { PieChart as PieIcon, BarChart3, AlertTriangle } from 'lucide-react'

// 🎨 PALETA DE COLORES "WARM" (Rojos y Naranjas para Gastos)
const COLOR_INGRESO = '#10b981'; // Emerald
const COLOR_GASTO = '#f43f5e';   // Rose/Red principal
const COLOR_NEUTRAL = '#94a3b8'; // Slate
const COLORS_GASTOS_WARM = [
  '#e11d48', // Rose 700 (Rojo Intenso)
  '#f43f5e', // Rose 500
  '#fb7185', // Rose 400
  '#fb923c', // Orange 400
  '#fdba74', // Orange 300
];

const formatoCLP = (valor: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor)

export default function GraficosFinancieros({ transacciones }: { transacciones: any[] }) {
  
  // 1. DATA: Flujo Mensual
  const datosMensuales = useMemo(() => {
    const mapa = new Map()
    transacciones.forEach(t => {
      const fecha = new Date(t.created_at)
      const mes = fecha.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase()
      if (!mapa.has(mes)) mapa.set(mes, { mes, ingresos: 0, gastos: 0, sort: fecha.getTime() })
      const actual = mapa.get(mes)
      if (t.tipo === 'ingreso') actual.ingresos += Number(t.monto)
      else actual.gastos += Number(t.monto)
    })
    return Array.from(mapa.values()).sort((a, b) => a.sort - b.sort)
  }, [transacciones])

  // 2. DATA: Distribución de Gastos
  const datosGastos = useMemo(() => {
    const gastos = transacciones.filter(t => t.tipo === 'gasto')
    const mapa = new Map()
    gastos.forEach(t => {
      const cat = (t.categoria || 'Otros').charAt(0).toUpperCase() + (t.categoria || 'Otros').slice(1).toLowerCase()
      mapa.set(cat, (mapa.get(cat) || 0) + Number(t.monto))
    })
    return Array.from(mapa.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transacciones])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
            {payload[0].payload.name || payload[0].payload.mes}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatoCLP(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
      
      {/* CHART 1: COMPARATIVA MENSUAL */}
      <div className="flex flex-col h-full min-h-[350px]">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl">
            <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flujo Mensual</h3>
        </div>
        
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosMensuales} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_INGRESO} stopOpacity={1}/>
                  <stop offset="100%" stopColor={COLOR_INGRESO} stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradGasto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_GASTO} stopOpacity={1}/>
                  <stop offset="100%" stopColor={COLOR_GASTO} stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={COLOR_NEUTRAL} opacity={0.1} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: COLOR_NEUTRAL, fontWeight: 700}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: COLOR_NEUTRAL, fontWeight: 700}} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148, 163, 184, 0.05)'}} />
              <Bar dataKey="ingresos" fill="url(#gradIngreso)" radius={[6, 6, 0, 0]} maxBarSize={25} />
              <Bar dataKey="gastos" fill="url(#gradGasto)" radius={[6, 6, 0, 0]} maxBarSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: DISTRIBUCIÓN DE GASTOS (ROJO/NARANJA) */}
      <div className="flex flex-col h-full min-h-[350px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl">
              <PieIcon size={18} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Distribución de Gastos</h3>
          </div>
          <AlertTriangle size={14} className="text-orange-400 animate-pulse" />
        </div>

        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosGastos}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={200}
                animationDuration={1500}
              >
                {datosGastos.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS_GASTOS_WARM[index % COLORS_GASTOS_WARM.length]} 
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                iconType="circle"
                layout="horizontal"
                wrapperStyle={{ 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  color: COLOR_NEUTRAL, 
                  paddingTop: '20px',
                  textTransform: 'capitalize' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Gastos</p>
            <p className="text-sm font-black text-rose-600 dark:text-rose-400">
              {formatoCLP(datosGastos.reduce((acc, curr) => acc + curr.value, 0))}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}