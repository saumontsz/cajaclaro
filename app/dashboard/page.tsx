export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Settings, LogOut, Key, Sparkles 
} from 'lucide-react'

// COMPONENTES
import ThemeToggle from './ThemeToggle'
import ProyeccionHitos from './ProyeccionHitos'
import GraficosFinancieros from './GraficosFinancieros' 
import GraficoRentabilidad from './GraficoRentabilidad'
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

  // CÁLCULO DE SALDOS CONSOLIDADOS
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
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50 dark:bg-slate-950 transition-colors font-sans">
      <Suspense><DashboardToast /></Suspense>

      {/* HEADER PRINCIPAL */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/50 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center w-full">
          
          <Link href="/dashboard" className="flex items-center gap-2 group transition-all">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Activity className="text-white" size={20} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Flujent</span>
              <span className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-800 mx-3" />
              <span className="text-xs sm:text-sm text-slate-400 font-bold truncate max-w-[150px] sm:max-w-none uppercase tracking-widest">
                {negocio.nombre}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard/configuracion" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
              <Settings size={20} />
            </Link>
            <form action={cerrarSesion}>
              <button type="submit" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2.5 rounded-xl transition-all">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-10">
        
        {/* RESUMEN DE INDICADORES (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard titulo="Caja Disponible" valor={cajaViva} tipo="neutro" subtitulo="Saldo consolidado total" />
          <KpiCard titulo="Ingresos Totales" valor={ingresosTotales} tipo="ingreso" subtitulo="Flujo de entrada acumulado" />
          <KpiCard titulo="Gastos Totales" valor={gastosTotales} tipo="gasto" subtitulo="Flujo de salida acumulado" />
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm transition-all group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.15em]">Suscripción</p>
              <Sparkles size={14} className="text-purple-400 group-hover:animate-pulse" />
            </div>
            <p className="text-2xl font-black dark:text-white capitalize">{planActual}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-400">
              <Key size={10} /> 
              {esPlanEmpresa ? 'Nivel Máximo' : esPlanPago ? 'Acceso Pro' : 'Nivel Básico'}
            </div>
          </div>
        </div>

        {/* SECCIÓN DE CUENTAS (CARRUSEL) */}
        <CuentasSection cuentas={cuentasProcesadas} planUsuario={planActual} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          
          {/* ⬅️ COLUMNA OPERATIVA (Manual & Importación) */}
          <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-28">
            
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-2 flex items-center gap-2">
                Operativa <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </h4>
              <NuevoMovimientoForm 
                negocioId={negocio.id} 
                cuentasActivas={cuentasBase} 
                plan={planActual} 
              />
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-2 flex items-center gap-2">
                Mapeo Bancario <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </h4>
              {esPlanEmpresa ? (
                <ImportadorExcel negocioId={negocio.id} />
              ) : (
                <FeatureLock titulo="Importación Masiva" descripcion="Sube planillas Excel (.xlsx) para mapear tus movimientos automáticamente." planRequerido="Empresa" />
              )}
            </section>

            {/* HISTORIAL SLIM */}
            <section>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800/50 transition-all">
                <div className="px-8 py-5 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800/50 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Movimientos</h3>
                  {esPlanPago && <BotonExportarExcel transacciones={txs} />}
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto no-scrollbar">
                  {txs.length === 0 ? (
                    <p className="p-12 text-center text-xs text-slate-400 font-bold italic">Cero movimientos en registro.</p>
                  ) : txs.map((tx) => (
                    <div key={tx.id} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${tx.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                          {tx.tipo === 'ingreso' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="min-w-0"> 
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px] text-sm tracking-tight">{tx.descripcion}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(tx.created_at).toLocaleDateString('es-CL')}</p>
                        </div>
                      </div>
                      <span className={`font-black tabular-nums text-sm ${tx.tipo === 'ingreso' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}${formatoCLP(tx.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* API SETTINGS - FIX TS PROP */}
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-2">Integración y API</h4>
              {esPlanEmpresa ? (
                <ApiSettings 
                  negocioId={negocio.id} 
                  apiKey={negocio.api_key} 
                  plan={planActual} // 🚀 FIX: Pasamos el plan para cumplir con la interface
                />
              ) : (
                <FeatureLock titulo="API REST" descripcion="Conecta tu ERP o software propio directamente con Flujent." planRequerido="Empresa" />
              )}
            </section>
          </div>

          {/* 📊 COLUMNA ESTRATÉGICA (Análisis & Proyección) */}
          <div className="xl:col-span-8 space-y-10">
            
            {/* RENTABILIDAD ACUMULADA */}
            <section>
              <div className="flex justify-between items-end mb-4 px-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salud Patrimonial</h4>
                <div className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase">Felicidad Financiera</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                   Visualiza cómo tu caja neta evoluciona en el tiempo. Una curva ascendente significa que estás **reteniendo ganancias** más allá de tus costos.
                 </p>
                 <GraficoRentabilidad transacciones={txs} />
              </div>
            </section>

            {/* FLUJO HISTÓRICO */}
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Análisis de Flujos</h4>
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
                 <GraficosFinancieros transacciones={txs} />
              </div>
            </section>

            {/* SIMULADOR IA */}
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Estrés de Mercado (IA)</h4>
              <Simulador negocio={negocio} transacciones={txs} />
            </section>

            {/* HITOS DE INVERSIÓN */}
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Plan de Proyectos</h4>
              <ProyeccionHitos 
                saldoInicial={cajaViva} 
                negocioId={negocio.id} 
                hitosGuardados={hitos} 
              />
            </section>

            {/* RECURRENCIAS */}
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Programación Automática</h4>
              <ListaRecurrentes recurrentes={recurrentes} />
            </section>
            
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({ titulo, valor, tipo, subtitulo }: { titulo: string, valor: number, tipo: 'ingreso' | 'gasto' | 'neutro', subtitulo: string }) {
  const color = tipo === 'ingreso' ? 'text-emerald-600' : tipo === 'gasto' ? 'text-rose-600' : 'text-slate-900 dark:text-white';
  const bg = tipo === 'ingreso' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : tipo === 'gasto' ? 'bg-rose-50/50 dark:bg-rose-900/10' : 'bg-white dark:bg-slate-900';
  
  return (
    <div className={`${bg} p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300`}>
      <p className="text-[10px] font-black uppercase mb-1 text-slate-400 tracking-[0.1em]">{titulo}</p>
      <p className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>
        ${new Intl.NumberFormat('es-CL').format(Math.round(valor))}
      </p>
      <div className="mt-3 text-[10px] font-bold uppercase text-slate-400/70 tracking-tight">{subtitulo}</div>
    </div>
  )
}