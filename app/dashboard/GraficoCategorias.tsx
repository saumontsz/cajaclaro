'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

export default function GraficoCategorias({ transacciones }: { transacciones: any[] }) {
  const gastos = transacciones.filter(t => t.tipo === 'gasto');
  
  const datosAgrupados = gastos.reduce((acc: any, curr) => {
    const cat = curr.categoria || 'Otros';
    acc[cat] = (acc[cat] || 0) + Number(curr.monto);
    return acc;
  }, {});

  const data = Object.keys(datosAgrupados).map(name => ({
    name,
    value: datosAgrupados[name]
  })).sort((a, b) => b.value - a.value);

  if (gastos.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <PieIcon size={18} className="text-pink-500" /> Distribución de Gastos por Categoría
      </h3>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number | undefined) => {
                if (typeof value === 'undefined') return '$0';
                return `$${new Intl.NumberFormat('es-CL').format(value)}`;
              }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}