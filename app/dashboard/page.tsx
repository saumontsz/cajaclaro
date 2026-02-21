import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { crearNegocio, cerrarSesion, agregarTransaccion } from './actions'
import { Activity, LogOut, Wallet, AlertTriangle, ArrowUpCircle, ArrowDownCircle, PlusCircle } from 'lucide-react'
import Simulador from './Simulador'
import ApiSettings from './ApiSettings'
import ImportadorExcel from './ImportadorExcel'
import OnboardingForm from './OnboardingForm'
import GraficosFinancieros from './GraficosFinancieros'
import BotonExportarExcel from './BotonExportarExcel'

import ThemeToggle from './ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*, plan, api_key')
    .eq('user_id', user.id)
    .single()

  if (!negocio) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-800 w-full max-w-md transition-colors">
          <OnboardingForm />
        </div>
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
  const riesgoAlto = cajaViva < 0;
  
  const formatoCLP = (valor: number) => new Intl.NumberFormat('es-CL').format(valor);

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      {/* Header con soporte oscuro */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Activity className="text-blue-600 dark:text-blue-500" size={20} />
          <span>Flujent</span>
          <span className="text-gray-300 dark:text-slate-700 font-light px-2">|</span>
          <span className="text-gray-600 dark:text-slate-400 font-normal">{negocio.nombre}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* 2. Aquí va el botón de tema */}
          <ThemeToggle />
          <form action={cerrarSesion}>
            <button type="submit" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
              <LogOut size={16} /> Salir
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {riesgoAlto && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 shadow-sm transition-colors">
            <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Tu caja está en negativo</h4>
              <p className="text-sm opacity-90">Tus gastos reales han superado tu saldo inicial y tus ingresos. Necesitas inyectar liquidez urgentemente.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            {/* Tarjeta del Formulario en Modo Oscuro */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm lg:sticky lg:top-24 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600 dark:text-blue-500" />
                Registrar Movimiento
              </h3>
              
              <form action={agregarTransaccion} className="flex flex-col gap-4">
                <input type="hidden" name="negocio_id" value={negocio.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo</label>
                  <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 text-gray-900 dark:text-white transition-colors">
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Monto ($)</label>
                  <input name="monto" type="number" required min="1" placeholder="Ej: 25000" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Concepto</label>
                  <input name="descripcion" type="text" required placeholder="Ej: Arriendo, Luz..." className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors" />
                </div>
                
                <button type="submit" className="w-full mt-2 px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
                  Guardar Movimiento
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            
            {/* KPIs en Modo Oscuro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-2">
                  <Wallet size={16} />
                  <h3 className="text-sm font-medium">Caja Disponible</h3>
                </div>
                <p className={`text-4xl font-bold ${cajaViva >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                  ${formatoCLP(cajaViva)}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
                 <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-2">
                  <ArrowUpCircle size={16} className="text-green-600 dark:text-green-500" />
                  <h3 className="text-sm font-medium">Total Ingresado</h3>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">${formatoCLP(ingresosReales)}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
                 <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-2">
                  <ArrowDownCircle size={16} className="text-red-600 dark:text-red-500" />
                  <h3 className="text-sm font-medium">Total Gastado</h3>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">${formatoCLP(gastosReales)}</p>
              </div>
            </div>

            {/* Gráficos */}
            <GraficosFinancieros transacciones={txs} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Lista de Movimientos en Modo Oscuro */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit transition-colors">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Últimos Movimientos</h3>
                  <BotonExportarExcel transacciones={txs} />
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto transition-colors">
                  {txs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                      No tienes movimientos aún.
                    </div>
                  ) : (
                    txs.map((tx: any) => (
                      <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {tx.tipo === 'ingreso' ? (
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-500"><ArrowUpCircle size={16} /></div>
                          ) : (
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-500"><ArrowDownCircle size={16} /></div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.descripcion}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.tipo === 'ingreso' ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'}`}>
                          {tx.tipo === 'ingreso' ? '+' : '-'}${formatoCLP(Number(tx.monto))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="mt-0">
                  <ImportadorExcel negocioId={negocio.id} />
                </div>
                
                <Simulador 
                  negocio={{
                    saldo_actual: cajaViva,
                    ingresos_mensuales: negocio.ingresos_mensuales,
                    gastos_fijos: negocio.gastos_fijos,
                    gastos_variables: negocio.gastos_variables
                  }} 
                />

                <ApiSettings plan={negocio.plan} apiKey={negocio.api_key} />
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}