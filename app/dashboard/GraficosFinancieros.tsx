'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react'

interface Props {
  transacciones: any[];
}

const COLORES = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'];

// Función para formatear números con puntos (ej: 5000000 -> 5.000.000)
const formatearDinero = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(valor);
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
      acc.push({
        fecha,
        Ingresos: tx.tipo === 'ingreso' ? Number(tx.monto) : 0,
        Gastos: tx.tipo === 'gasto' ? Number(tx.monto) : 0
      });
    }
    return acc;
  }, []).reverse(); 

  const gastos = transacciones.filter(tx => tx.tipo === 'gasto');
  const datosTorta = gastos.reduce((acc: any[], tx) => {
    const concepto = tx.descripcion.substring(0, 15) + (tx.descripcion.length > 15 ? '...' : ''); 
    const existente = acc.find(item => item.name === concepto);
    
    if (existente) {
      existente.value += Number(tx.monto);
    } else {
      acc.push({ name: concepto, value: Number(tx.monto) });
    }
    return acc;
  }, [])
  .sort((a: any, b: any) => b.value - a.value) 
  .slice(0, 5); 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Gráfico de Barras */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <BarChart3 className="text-blue-600" size={20} />
          <h3 className="font-semibold text-lg">Flujo Diario</h3>
        </div>
        <div className="w-full min-h-[300px] flex-1 text-xs">
          <ResponsiveContainer width="100%" height="100%">
            {/* Margen ajustado para que los números no se corten */}
            <BarChart data={datosBarras} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }} 
                tickFormatter={(value) => `$${formatearDinero(value)}`}
                width={70} // Ancho fijo para el eje Y para evitar cortes con números grandes
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${formatearDinero(value)}`, '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Torta */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <PieChartIcon className="text-blue-600" size={20} />
          <h3 className="font-semibold text-lg">Distribución de Gastos</h3>
        </div>
        
        {datosTorta.length > 0 ? (
          <div className="w-full min-h-[300px] flex-1 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosTorta}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {datosTorta.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${formatearDinero(value)}`, 'Total']}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center text-gray-400 text-sm flex-1 border-2 border-dashed border-gray-100 rounded-xl">
            Registra tu primer gasto para ver el análisis.
          </div>
        )}
      </div>

    </div>
  )
}