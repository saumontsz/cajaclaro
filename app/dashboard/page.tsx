import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { crearNegocio, cerrarSesion } from './actions'
import { Activity, LogOut, Wallet, TrendingUp, TrendingDown, Calendar, Percent, AlertTriangle } from 'lucide-react'
import Simulador from './Simulador'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!negocio) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configura tu negocio</h2>
          <p className="text-sm text-gray-500 mb-6">Ingresa tus números actuales para empezar a proyectar.</p>
          <form action={crearNegocio} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
              <input name="nombre" type="text" required placeholder="Ej: Mi Tienda" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo en caja actual ($)</label>
              <input name="saldo_actual" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos promedio mensuales ($)</label>
              <input name="ingresos_mensuales" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos Fijos ($)</label>
                <input name="gastos_fijos" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos Variables ($)</label>
                <input name="gastos_variables" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Guardar y ver proyección
            </button>
          </form>
        </div>
      </main>
    )
  }

  // --- MOTOR FINANCIERO (Lógica de cálculo) ---
  const gastosTotales = negocio.gastos_fijos + negocio.gastos_variables;
  const flujoMensual = negocio.ingresos_mensuales - gastosTotales;
  
  // Margen: (Flujo / Ingresos) * 100
  const margen = negocio.ingresos_mensuales > 0 ? Math.round((flujoMensual / negocio.ingresos_mensuales) * 100) : 0;
  
  // Días de supervivencia: Saldo / Gasto diario
  const gastoDiario = gastosTotales / 30;
  const diasSupervivencia = gastoDiario > 0 ? Math.round(negocio.saldo_actual / gastoDiario) : 9999;
  
  // Proyección a 90 días (3 meses)
  const proyeccion90Dias = negocio.saldo_actual + (flujoMensual * 3);
  
  // Alertas
  const riesgoAlto = flujoMensual < 0;
  const colorSupervivencia = diasSupervivencia < 30 ? 'text-red-600' : diasSupervivencia < 90 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Activity className="text-blue-600" size={20} />
          <span>CajaClaro</span>
          <span className="text-gray-300 font-light px-2">|</span>
          <span className="text-gray-600 font-normal">{negocio.nombre}</span>
        </div>
        <form action={cerrarSesion}>
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </form>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        
        {/* Alerta de Riesgo Alto */}
        {riesgoAlto && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Riesgo Crítico de Liquidez</h4>
              <p className="text-sm opacity-90">Tu flujo mensual es negativo. Estás quemando caja todos los meses. Revisa tus gastos urgentes o busca aumentar ingresos.</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Salud Financiera</h1>
          <p className="text-gray-500 text-sm mt-1">Análisis basado en tus números actuales.</p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Activity size={16} />
              <h3 className="text-sm font-medium">Flujo Mensual</h3>
            </div>
            <p className={`text-2xl font-semibold ${flujoMensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${flujoMensual}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Percent size={16} />
              <h3 className="text-sm font-medium">Margen Operativo</h3>
            </div>
            <p className={`text-2xl font-semibold ${margen >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {margen}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar size={16} />
              <h3 className="text-sm font-medium">Días de Supervivencia</h3>
            </div>
            <p className={`text-2xl font-semibold ${colorSupervivencia}`}>
              {diasSupervivencia === 9999 ? '∞' : diasSupervivencia} <span className="text-sm font-normal text-gray-500">días</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Wallet size={16} />
              <h3 className="text-sm font-medium">Caja (90 días)</h3>
            </div>
            <p className={`text-2xl font-semibold ${proyeccion90Dias >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ${proyeccion90Dias}
            </p>
          </div>

        </div>

        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
         <Simulador negocio={negocio} />
        </div>
      </main>
    </div>
  )
}