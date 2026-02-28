export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Settings, LogOut, Key 
} from 'lucide-react'

// COMPONENTES
import ThemeToggle from './ThemeToggle'
import ProyeccionHitos from './ProyeccionHitos'
import GraficosFinancieros from './GraficosFinancieros' 
import GraficoRentabilidad from './GraficoRentabilidad' // 🚀 NUEVO
import ApiSettings from './ApiSettings'
import ImportadorExcel from './ImportadorExcel'
import BotonExportarExcel from './BotonExportarExcel'
import Simulador from './Simulador'
import NuevoMovimientoForm from './NuevoMovimientoForm'
import { cerrarSesion } from './actions'
import OnboardingFlow from './OnboardingForm'
import FeatureLock from './FeatureLock'
import CuentasSection from './CuentasSection' 
import DashboardToast from './DashboardToast' 
import ListaRecurrentes from './ListaRecurrentes'

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
  if (!negocio) return <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950"><OnboardingFlow /></main>

  const [transaccionesRes, hitosRes, recurrentesRes, cuentasRes] = await Promise.all([
    supabase.from('transacciones').select('*').eq('negocio_id', negocio.id).order('created_at', { ascending: false }),
    supabase.from('hitos').select('*').eq('negocio_id', negocio.id).order('created_at', { ascending: false }),
    supabase.from('movimientos_recurrentes').select('*').eq('negocio_id', negocio.id).order('proxima_ejecucion', { ascending: true }),
    supabase.from('cuentas').select('id, nombre, saldo_inicial, tipo').eq('negocio_id', negocio.id)
  ])

  const transacciones = transaccionesRes.data || []
  const hitos = hitosRes.data || []
  const recurrentes = recurrentesRes.data || []
  const cuentasBase = cuentasRes.data || []
  const txs = transacciones.map((t: any) => ({ ...t, monto: Number(t.monto) }));

  // CÁLCULO DE SALDOS
  const cuentasProcesadas = cuentasBase.map((cuenta: any) => {
    const movimientosCuenta = txs.filter(t => t.cuenta_id === cuenta.id);
    const ingresos = movimientosCuenta.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
    const gastos = movimientosCuenta.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0);
    return { ...cuenta, saldo_actual: Number(cuenta.saldo_inicial) + ingresos - gastos };
  });

  const cajaViva = cuentasProcesadas.reduce((acc, c) => acc + c.saldo_actual, 0);
  const ingresosTotales = txs.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
  const gastosTotales = txs.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + t.monto, 0);
  
  // LOGICA DE PLANES
  const planActual = (negocio.plan || 'gratis').toLowerCase();
  const esPlanEmpresa = ['empresa', 'pro_empresa', 'negocio'].includes(planActual);
  const esPlanPago = planActual !== 'gratis';

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      <Suspense><DashboardToast /></Suspense>

      {/* HEADER CON LOGO OFICIAL */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/50 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center w-full">
          
          <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Activity className="text-white" size={18} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Flujent</span>
              <span className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-800 mx-3" />
              <span className="text-[11px] sm:text-sm text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">
                {negocio.nombre}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard/configuracion" className="p-2 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
              <Settings size={20} />
            </Link>
            <form action={cerrarSesion}>
              <button type="submit" className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        
        {/* INDICADORES CLAVE (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard titulo="Caja Disponible" valor={cajaViva} tipo="neutro" subtitulo="Saldo consolidado" />
          <KpiCard titulo="Ingresos Totales" valor={ingresosTotales} tipo="ingreso" subtitulo="Total histórico" />
          <KpiCard titulo="Gastos Totales" valor={gastosTotales} tipo="gasto" subtitulo="Total histórico" />
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] font-bold text-purple-500 uppercase mb-1 tracking-wider">Plan Activo</p>
            <p className="text-2xl font-black dark:text-white capitalize">{planActual}</p>
            <div className="mt-2 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Key size={10} /> 
              {esPlanEmpresa ? 'Acceso total' : esPlanPago ? 'Acceso intermedio' : 'Acceso limitado'}
            </div>
          </div>
        </div>

        <CuentasSection cuentas={cuentasProcesadas} planUsuario={planActual} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* ⬅️ COLUMNA IZQUIERDA: OPERATIVA */}
          <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">
            
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Registro de Movimientos</h4>
              <NuevoMovimientoForm 
                negocioId={negocio.id} 
                cuentasActivas={cuentasBase} 
                plan={planActual} 
              />
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Sincronización Bancaria</h4>
              {esPlanEmpresa ? (
                <ImportadorExcel negocioId={negocio.id} />
              ) : (
                <FeatureLock titulo="Importación Masiva" descripcion="Sube archivos de banco (.xlsx) para conciliar automáticamente." planRequerido="Empresa" />
              )}
            </section>

            <section>
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800/50 transition-colors">
                <div className="px-6 py-5 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historial</h3>
                  {esPlanPago && <BotonExportarExcel transacciones={txs} />}
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {txs.length === 0 ? (
                    <p className="p-10 text-center text-xs text-slate-400 font-medium">No hay movimientos registrados.</p>
                  ) : txs.map((tx) => (
                    <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.tipo === 'ingreso' ? 'bg-green-50 text-green-600 dark:bg-green-900/10' : 'bg-red-50 text-red-600 dark:bg-red-900/10'}`}>
                          {tx.tipo === 'ingreso' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="min-w-0"> 
                          <p className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px] text-sm">{tx.descripcion}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.created_at).toLocaleDateString('es-CL')}</p>
                        </div>
                      </div>
                      <span className={`font-bold tabular-nums text-xs ${tx.tipo === 'ingreso' ? 'text-green-600' : 'text-slate-700 dark:text-slate-200'}`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}${formatoCLP(tx.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Integración y API</h4>
               {esPlanEmpresa ? (
                 <ApiSettings negocioId={negocio.id} apiKey={negocio.api_key} />
               ) : (
                 <FeatureLock titulo="API REST" descripcion="Conecta tu ERP o software directamente con Flujent." planRequerido="Empresa" />
               )}
            </section>
          </div>

          {/* 📊 COLUMNA DERECHA: ESTRATEGIA Y ANÁLISIS */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* 🚀 NUEVA SECCIÓN: RENTABILIDAD ACUMULADA */}
            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Crecimiento Patrimonial</h4>
                  
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase hidden sm:block">Tendencia de flujo neto</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors">
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                   Suma progresiva de tus beneficios. Una curva ascendente indica retención de capital y salud financiera.
                 </p>
                 <GraficoRentabilidad transacciones={txs} />
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Flujo de Caja Histórico</h4>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800/50 transition-colors">
                 <GraficosFinancieros transacciones={txs} />
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Simulador de Inteligencia Financiera</h4>
              <Simulador negocio={negocio} transacciones={txs} />
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Planificador de Inversiones</h4>
              <ProyeccionHitos 
                saldoInicial={cajaViva} 
                negocioId={negocio.id} 
                hitosGuardados={hitos} 
              />
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Movimientos Recurrentes</h4>
              <ListaRecurrentes recurrentes={recurrentes} />
            </section>
            
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({ titulo, valor, tipo, subtitulo }: { titulo: string, valor: number, tipo: 'ingreso' | 'gasto' | 'neutro', subtitulo: string }) {
  const color = tipo === 'ingreso' ? 'text-green-600' : tipo === 'gasto' ? 'text-red-500' : 'text-slate-900 dark:text-white';
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md transition-colors">
      <p className="text-[10px] font-bold uppercase mb-1 text-slate-400 tracking-wider">{titulo}</p>
      <p className={`text-2xl font-black tabular-nums ${color}`}>${new Intl.NumberFormat('es-CL').format(Math.round(valor))}</p>
      <div className="mt-2 text-[10px] font-bold uppercase text-slate-400">{subtitulo}</div>
    </div>
  )
}