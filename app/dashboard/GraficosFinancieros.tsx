'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts'
import { PieChart as PieChartIcon, BarChart3, Info, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react'

interface Props {
  transacciones: any[];
}

const COLORES = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'];

const formatearDinero = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

const tooltipEstiloPro = {
  contentStyle: { 
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    border: 'none', 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    padding: '12px'
  },
  labelStyle: { color: '#64748b', fontWeight: 'bold', marginBottom: '4px' },
  itemStyle: { color: '#0f172a', fontSize: '14px', fontWeight: '800' }
};

export default function GraficosFinancieros({ transacciones }: Props) {
  if (!transacciones || transacciones.length === 0) return null;

  const ahora = new Date();
  const mesActualIdx = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  // --- 1. LÓGICA: INGRESOS MES ACTUAL ---
  const ingresosMesActual = transacciones
    .filter(tx => {
      const d = new Date(tx.created_at);
      return d.getMonth() === mesActualIdx && d.getFullYear() === añoActual && tx.tipo === 'ingreso';
    })
    .reduce((sum, tx) => sum + Number(tx.monto), 0);

  // --- 2. LÓGICA: INGRESOS MES ANTERIOR ---
  const mesAnteriorIdx = mesActualIdx === 0 ? 11 : mesActualIdx - 1;
  const añoAnterior = mesActualIdx === 0 ? añoActual - 1 : añoActual;

  const ingresosMesAnterior = transacciones
    .filter(tx => {
      const d = new Date(tx.created_at);
      return d.getMonth() === mesAnteriorIdx && d.getFullYear() === añoAnterior && tx.tipo === 'ingreso';
    })
    .reduce((sum, tx) => sum + Number(tx.monto), 0);

  // Cálculo de variación porcentual
  const diferencia = ingresosMesActual - ingresosMesAnterior;
  const porcentajeVariacion = ingresosMesAnterior > 0 
    ? Math.round((diferencia / ingresosMesAnterior) * 100) 
    : (ingresosMesActual > 0 ? 100 : 0);

  // --- 3. PROCESAR HISTÓRICO (Área) ---
  const procesarHistorico = (txs: any[]) => {
    const mesesMap: any = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(ahora.getMonth() - i);
      const label = d.toLocaleDateString('es-CL', { month: 'short' });
      mesesMap[label] = { name: label, ingresos: 0 };
    }
    txs.forEach(tx => {
      if (tx.tipo === 'ingreso') {
        const label = new Date(tx.created_at).toLocaleDateString('es-CL', { month: 'short' });
        if (mesesMap[label]) mesesMap[label].ingresos += Number(tx.monto);
      }
    });
    return Object.values(mesesMap);
  };

  // --- 4. AGRUPACIÓN SEMANAL (Barras) ---
  const procesarDatosBarras = (txs: any[]) => {
    const grupos = txs.reduce((acc: any, tx) => {
      const fecha = new Date(tx.created_at);
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - fecha.getDay() + (fecha.getDay() === 0 ? -6 : 1));
      const etiqueta = lunes.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
      if (!acc[etiqueta]) acc[etiqueta] = { fecha: etiqueta, Ingresos: 0, Gastos: 0, sortKey: lunes.getTime() };
      if (tx.tipo === 'ingreso') acc[etiqueta].Ingresos += Number(tx.monto);
      else acc[etiqueta].Gastos += Number(tx.monto);
      return acc;
    }, {});
    return Object.values(grupos).sort((a: any, b: any) => a.sortKey - b.sortKey);
  };

  // --- 5. DISTRIBUCIÓN GASTOS (Torta) ---
  const gastos = transacciones.filter(tx => tx.tipo === 'gasto');
  const datosTorta = gastos.reduce((acc: any[], tx) => {
    const concepto = tx.descripcion.substring(0, 15) + (tx.descripcion.length > 15 ? '...' : ''); 
    const existente = acc.find(item => item.name === concepto);
    if (existente) { existente.value += Number(tx.monto); } else { acc.push({ name: concepto, value: Number(tx.monto) }); }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 5); 

  return (
    <div className="space-y-6 mb-8">
      
      {/* FILA SUPERIOR: COMPARATIVA MENSUAL E HISTÓRICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card: Mes Actual vs Mes Anterior */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-slate-400">
            <CalendarDays size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Rendimiento Mensual</h3>
          </div>
          
          <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white leading-tight break-words">
            ${formatearDinero(ingresosMesActual)}
          </p>

          <div className="mt-6 flex flex-col gap-1">
            <div className={`flex items-center gap-1 font-bold text-sm ${porcentajeVariacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {porcentajeVariacion >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
              {porcentajeVariacion >= 0 ? '+' : ''}{porcentajeVariacion}%
              <span className="text-[10px] text-slate-400 ml-1 uppercase tracking-tight">vs mes anterior</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Mes anterior: ${formatearDinero(ingresosMesAnterior)}
            </p>
          </div>
        </div>

        {/* Card: Crecimiento de Ingresos */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
            <TrendingUp className="text-green-600" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Crecimiento de Ingresos</h3>
          </div>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={procesarHistorico(transacciones)}>
                <defs>
                  <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip {...tooltipEstiloPro} formatter={(v:any) => [`$${formatearDinero(v)}`, 'Ingresos']} />
                <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngreso)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILA INFERIOR: FLUJO SEMANAL Y TORTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
              <BarChart3 className="text-blue-600" size={20} />
              <h3 className="font-bold text-lg tracking-tight">Flujo Semanal</h3>
            </div>
          </div>
          <div className="w-full h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procesarDatosBarras(transacciones)} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} {...tooltipEstiloPro} formatter={(v: any) => [`$${formatearDinero(Number(v))}`, '']} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white">
            <PieChartIcon className="text-purple-600" size={20} />
            <h3 className="font-bold text-lg tracking-tight">Distribución de Gastos</h3>
          </div>
          {datosTorta.length > 0 ? (
            <div className="w-full h-[300px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosTorta} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {datosTorta.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipEstiloPro} formatter={(v: any) => [`$${formatearDinero(Number(v))}`, 'Total']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">Sin gastos registrados</div>
          )}
        </div>
      </div>
    </div>
  )
}