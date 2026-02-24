export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp, TrendingDown, Activity, LogOut, Lock, LayoutDashboard, Settings 
} from 'lucide-react'

// IMPORTACIONES DE COMPONENTES
import ThemeToggle from './ThemeToggle'
import ProyeccionHitos from './ProyeccionHitos'
import GraficosFinancieros from './GraficosFinancieros' 
import ApiSettings from './ApiSettings'
import ImportadorExcel from './ImportadorExcel'
import BotonExportarExcel from './BotonExportarExcel'
import Simulador from './Simulador'
import NuevoMovimientoForm from './NuevoMovimientoForm'
import { cerrarSesion } from './actions'
import OnboardingFlow from './OnboardingForm'
import FeatureLock from './FeatureLock'

// INTERFAZ
interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto' | string;
  monto: number;
  descripcion: string;
  created_at: string;
  categoria?: string;
}

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(valor));
};

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. DATA FETCHING
  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!negocio) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
        <OnboardingFlow /> 
      </main>
    )
  }

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('created_at', { ascending: false })

  const { data: hitos } = await supabase
    .from('hitos')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('created_at', { ascending: false })

  // 2. PROCESAMIENTO DE DATOS
  const txs: Transaccion[] = (transacciones || []).map((t: any) => ({
    ...t,
    monto: Number(t.monto) 
  }));
  
  const ingresosReales = txs
    .filter((t) => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const gastosReales = txs
    .filter((t) => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);

  const cajaViva = Number(negocio.saldo_actual) + ingresosReales - gastosReales;
  
  const gastosMensualesEstimados = (negocio.gastos_fijos || 0) + (negocio.gastos_variables || 0);
  const flujoNetoMensual = (negocio.ingresos_mensuales || 0) - gastosMensualesEstimados;
  const diasVida = flujoNetoMensual < 0 
    ? Math.floor(cajaViva / (Math.abs(flujoNetoMensual) / 30)) 
    : Infinity;

  const planActual = (negocio.plan || 'gratis').toLowerCase();
  const esPremium = planActual !== 'gratis'; 
  const esPlanEmpresa = ['pyme', 'negocio', 'empresa', 'pro_empresa'].includes(planActual);

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      
      {/* HEADER */}
      {/* Ajusté el px-4 para móviles y px-6 para escritorio */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutDashboard className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">Flujent</span>
            {/* Ocultamos el nombre del negocio en móviles muy pequeños si es necesario, o lo dejamos */}
            <span className="text-gray-300 dark:text-slate-700 px-2 hidden sm:inline">/</span>
            <span className="text-gray-600 dark:text-slate-400 font-normal hidden sm:inline">{negocio.nombre}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Link 
              href="/dashboard/configuracion" 
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-lg transition-all"
              title="Configuración"
            >
              <Settings size={20} />
            </Link>

            <form action={cerrarSesion}>
              <button type="submit" className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-2 transition-colors font-medium p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                <LogOut size={18} /> <span className="hidden md:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {/* Reduje p-6 a p-4 en móviles para ganar espacio lateral */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        
        {/* SECCIÓN 1: KPIs (Fila Superior) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            titulo="Caja Disponible" 
            valor={cajaViva} 
            tipo="neutro" 
            subtitulo={cajaViva > 0 ? 'Saludable' : 'Crítico'} 
          />
          <KpiCard 
            titulo="Ingresos Totales" 
            valor={ingresosReales} 
            tipo="ingreso" 
            subtitulo="Ventas acumuladas" 
          />
          <KpiCard 
            titulo="Gastos Totales" 
            valor={gastosReales} 
            tipo="gasto" 
            subtitulo="Salidas acumuladas" 
          />
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-purple-500 uppercase mb-1">Supervivencia</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white truncate">
                {diasVida === Infinity ? 'Resistencia Total' : `${diasVida} días`}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Runway estimado</p>
          </div>
        </div>

        {/* SECCIÓN 2: GRID PRINCIPAL (BENTO LAYOUT) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: HERRAMIENTAS (4 columnas de ancho) */}
          {/* CORRECCIÓN CRÍTICA: 'xl:sticky' en lugar de 'sticky'. 
              Esto evita que en el celular esta columna se quede pegada encima de todo al bajar. */}
          <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">
            
            {/* 1. Formulario de Ingreso Rápido */}
            <NuevoMovimientoForm negocioId={negocio.id} />

            {/* 2. Simulador IA (Runway) */}
            <div className="mt-0"> 
              <Simulador negocio={negocio} transacciones={txs} />
            </div>

            {/* 3. Simulador de Inversiones (Hitos) */}
            {esPremium ? (
              <ProyeccionHitos 
                saldoInicial={cajaViva} 
                negocioId={negocio.id} 
                hitosGuardados={hitos || []} 
              />
            ) : (
              <FeatureLock titulo="Proyecciones" descripcion="Simula compras futuras." planRequerido="Personal" />
            )}
            
            {/* 4. API Settings */}
            {esPlanEmpresa && (
               <ApiSettings plan={planActual} apiKey={negocio.api_key} negocioId={negocio.id} />
            )}
          </div>

          {/* COLUMNA DERECHA: DATOS Y GRÁFICOS (8 columnas de ancho) */}
          {/* En móvil, esta columna fluirá naturalmente debajo de la anterior */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* 1. Gráficos */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-4 md:p-6 shadow-sm overflow-hidden">
               <GraficosFinancieros transacciones={txs} />
            </div>

            {/* 2. Importador y Historial juntos */}
            <div className="space-y-4">
              {esPlanEmpresa ? (
                <ImportadorExcel negocioId={negocio.id} />
              ) : (
                <FeatureLock titulo="Importación Masiva" descripcion="Sube Excel bancario." planRequerido="Empresa" />
              )}

              {/* Historial de Transacciones */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Últimos Movimientos</h3>
                  {esPremium ? (
                    <BotonExportarExcel transacciones={txs} />
                  ) : (
                    <button disabled className="opacity-50 text-xs flex items-center gap-1"><Lock size={12}/> Exportar</button>
                  )}
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                  {txs.map((tx) => (
                    <div key={tx.id} className="p-4 px-4 md:px-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center gap-3 md:gap-4 text-sm">
                        <div className={`p-2 rounded-full shrink-0 ${tx.tipo === 'ingreso' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
                          {tx.tipo === 'ingreso' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div className="min-w-0"> {/* min-w-0 ayuda a que el texto trunque en móviles */}
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate max-w-[150px] sm:max-w-none">{tx.descripcion}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{new Date(tx.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-base whitespace-nowrap ${tx.tipo === 'ingreso' ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'}`}>
                        {tx.tipo === 'ingreso' ? '+' : '-'}${formatoCLP(tx.monto)}
                      </span>
                    </div>
                  ))}
                  {txs.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-slate-400 text-sm">No hay movimientos registrados.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

// Subcomponente KPI
function KpiCard({ titulo, valor, tipo, subtitulo }: { titulo: string, valor: number, tipo: 'ingreso' | 'gasto' | 'neutro', subtitulo: string }) {
  const color = tipo === 'ingreso' ? 'text-green-600' : tipo === 'gasto' ? 'text-red-500' : 'text-slate-900 dark:text-white';
  const bg = tipo === 'neutro' ? (valor > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : '';

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <p className={`text-[10px] font-bold uppercase mb-1 ${tipo === 'gasto' ? 'text-red-500' : tipo === 'ingreso' ? 'text-green-600' : 'text-slate-500'}`}>{titulo}</p>
        <p className={`text-2xl font-black truncate ${color}`}>${new Intl.NumberFormat('es-CL').format(Math.round(valor))}</p>
      </div>
      {tipo === 'neutro' ? (
        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${bg}`}>
          {subtitulo}
        </span>
      ) : (
        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
          {tipo === 'ingreso' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{subtitulo}</span>
        </div>
      )}
    </div>
  )
}