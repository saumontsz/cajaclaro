'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react'

interface Props {
  transacciones: any[];
}

const COLORES = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'];

const formatearDinero = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(valor);
};

// Estilo de Tooltip profesional y legible
const tooltipEstiloPro = {
  contentStyle: { 
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    border: 'none', 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    padding: '12px'
  },
  labelStyle: { 
    color: '#64748b', 
    fontWeight: 'bold', 
    marginBottom: '4px' 
  },
  itemStyle: { 
    color: '#0f172a', // Color oscuro intenso para los números
    fontSize: '14px', 
    fontWeight: '800' 
  }
};

export default function GraficosFinancieros({ transacciones }: Props) {
  if (!transacciones || transacciones.length === 0) {
    return null; 
  }

  const datosBarras = transacciones.reduce((acc: any[], tx) => {
    const fecha = new Date(tx.created_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
    const existente = acc.find(item => item.fecha === fecha);
    if (existente) {
      if (tx.tipo === 'ingreso') existente.Ingresos += Number(tx.monto);
      if (tx.tipo === 'gasto') existente.Gastos += Number(tx.monto);
    } else {
      acc.push({ fecha, Ingresos: tx.tipo === 'ingreso' ? Number(tx.monto) : 0, Gastos: tx.tipo === 'gasto' ? Number(tx.monto) : 0 });
    }
    return acc;
  }, []).reverse(); 

  const gastos = transacciones.filter(tx => tx.tipo === 'gasto');
  const datosTorta = gastos.reduce((acc: any[], tx) => {
    const concepto = tx.descripcion.substring(0, 15) + (tx.descripcion.length > 15 ? '...' : ''); 
    const existente = acc.find(item => item.name === concepto);
    if (existente) { existente.value += Number(tx.monto); } else { acc.push({ name: concepto, value: Number(tx.monto) }); }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 5); 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Tarjeta Gráfico de Barras */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white">
          <BarChart3 className="text-blue-600 dark:text-blue-500" size={20} />
          <h3 className="font-bold text-lg tracking-tight">Flujo Diario</h3>
        </div>
        <div className="w-full min-h-[300px] flex-1 text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosBarras} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                {...tooltipEstiloPro}
                formatter={(value: any) => [`$${formatearDinero(Number(value || 0))}`, '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tarjeta Gráfico de Torta (CORREGIDO) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white">
          <PieChartIcon className="text-purple-600 dark:text-purple-500" size={20} />
          <h3 className="font-bold text-lg tracking-tight">Distribución de Gastos</h3>
        </div>
        
        {datosTorta.length > 0 ? (
          <div className="w-full min-h-[300px] flex-1 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosTorta} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {datosTorta.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  // Aplicamos el estilo de alto contraste
                  {...tooltipEstiloPro}
                  formatter={(value: any) => [`$${formatearDinero(Number(value || 0))}`, 'Total']}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm flex-1 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl">
            Registra tu primer gasto para ver el análisis.
          </div>
        )}
      </div>

    </div>
  )
}