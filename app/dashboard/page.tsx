import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Wallet, TrendingUp, TrendingDown, Zap, PlusCircle, 
  BarChart3, Activity, LogOut, AlertCircle, ArrowUpCircle
} from 'lucide-react'

import ThemeToggle from './ThemeToggle'
import OnboardingForm from './OnboardingForm'
import ProyeccionHitos from './ProyeccionHitos'
import GraficosFinancieros from './GraficosFinancieros'
import ApiSettings from './ApiSettings'
import ImportadorExcel from './ImportadorExcel'
import BotonExportarExcel from './BotonExportarExcel'
import Simulador from './Simulador'
import { cerrarSesion, agregarTransaccion } from './actions'
import OnboardingFlow from './OnboardingFlow'

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

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
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
        {/* AQUÍ ESTÁ LA MAGIA: Llamamos al Flow, no al Form directo */}
        <OnboardingFlow /> 
      </main>
    )
  }

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('created_at', { ascending: false })

  const txs = transacciones || [];
  const ingresosReales = txs.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + Number(t.monto), 0);
  const gastosReales = txs.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + Number(t.monto), 0);
  const cajaViva = Number(negocio.saldo_actual) + ingresosReales - gastosReales;
  
  const gastosMensualesEstimados = (negocio.gastos_fijos || 0) + (negocio.gastos_variables || 0);
  const flujoNetoMensual = (negocio.ingresos_mensuales || 0) - gastosMensualesEstimados;
  const diasVida = flujoNetoMensual < 0 
    ? Math.floor(cajaViva / (Math.abs(flujoNetoMensual) / 30)) 
    : Infinity;

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Activity className="text-blue-600" size={20} />
          <span className="text-xl font-bold tracking-tight">Flujent</span>
          <span className="text-gray-300 dark:text-slate-700 px-2">|</span>
          <span className="text-gray-600 dark:text-slate-400 font-normal">{negocio.nombre}</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <form action={cerrarSesion}>
            <button type="submit" className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-2 transition-colors">
              <LogOut size={16} /> Salir
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* KPIs CORREGIDOS: AHORA SON 4 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Caja Disponible</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">${formatoCLP(cajaViva)}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cajaViva > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700'}`}>
              {cajaViva > 0 ? 'Saludable' : 'Crítico'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Ingresos Totales</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">${formatoCLP(ingresosReales)}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span>Acumulado de ventas</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Gastos Totales</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">${formatoCLP(gastosReales)}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
              <TrendingDown size={12} className="text-red-500" />
              <span>Flujo de salida</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500">
            <p className="text-[10px] font-bold text-purple-500 uppercase mb-1">Supervivencia</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {diasVida === Infinity ? 'Resistencia' : `${diasVida} días`}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Días de caja restante</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm sticky top-24">
              {/* TEXTO CORREGIDO: text-gray-900 dark:text-white */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600" /> Nuevo Movimiento
              </h3>
              <form action={agregarTransaccion} className="flex flex-col gap-4">
                <input type="hidden" name="negocio_id" value={negocio.id} />
                <select name="tipo" className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
                <input name="monto" type="number" placeholder="Monto ($)" required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="descripcion" type="text" placeholder="Concepto" required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">Guardar</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <GraficosFinancieros transacciones={txs} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Historial</h3>
                  <BotonExportarExcel transacciones={txs} />
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                  {txs.map((tx: any) => (
                    <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm">
                        <span className={tx.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'}>
                          {tx.tipo === 'ingreso' ? '↑' : '↓'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tx.descripcion}</p>
                          <p className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.tipo === 'ingreso' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                        ${formatoCLP(tx.monto)}
                      </span>
                    </div>
                  ))}
                  {txs.length === 0 && <p className="p-12 text-center text-gray-400 text-sm italic">No hay registros aún.</p>}
                </div>
              </div>

              <div className="space-y-8">
                <ProyeccionHitos saldoInicial={cajaViva} />
                <ImportadorExcel negocioId={negocio.id} />
                <Simulador negocio={negocio} />
                <ApiSettings plan={negocio.plan} apiKey={negocio.api_key} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}