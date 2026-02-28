'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GraficoRentabilidad({ transacciones }: { transacciones: any[] }) {
  const { data, esCreciente } = useMemo(() => {
    const mesesMap: Record<string, { neto: number; fecha: Date }> = {}
    transacciones.forEach((tx) => {
      const fecha = new Date(tx.created_at)
      const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`
      if (!mesesMap[key]) mesesMap[key] = { neto: 0, fecha: new Date(fecha.getFullYear(), fecha.getMonth(), 1) }
      mesesMap[key].neto += tx.tipo === 'ingreso' ? Number(tx.monto) : -Number(tx.monto)
    })

    const mesesOrdenados = Object.values(mesesMap).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    let acumulado = 0
    const finalData = mesesOrdenados.map((m) => {
      acumulado += m.neto
      return {
        mes: m.fecha.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase(),
        valor: acumulado,
      }
    })

    // 🚀 Lógica de tendencia: ¿El último mes es mejor que el penúltimo?
    const esCreciente = finalData.length >= 2 
      ? finalData[finalData.length - 1].valor >= finalData[finalData.length - 2].valor
      : true

    return { data: finalData, esCreciente }
  }, [transacciones])

  // 🎨 Paleta Dinámica
  const colorPrincipal = esCreciente ? '#10b981' : '#f43f5e' // Esmeralda vs Rosa

  return (
    <div className="h-[320px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDynamic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPrincipal} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colorPrincipal} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#94a3b8" opacity={0.1} />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }} dy={15} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
                    <p className="text-sm font-bold" style={{ color: colorPrincipal }}>
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(payload[0].value)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke={colorPrincipal} 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorDynamic)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}