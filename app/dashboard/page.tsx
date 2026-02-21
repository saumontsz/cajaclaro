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
    // VISTA: Formulario inicial inteligente
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-md">
          <OnboardingForm />
        </div>
      </main>
    )
  }

  // 1. OBTENER TRANSACCIONES
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('negocio_id', negocio.id)
    .order('created_at', { ascending: false })

  const txs = transacciones || [];

  // 2. MOTOR FINANCIERO DINÁMICO
  const ingresosReales = txs.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + Number(t.monto), 0);
  const gastosReales = txs.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + Number(t.monto), 0);
  
  const cajaViva = Number(negocio.saldo_actual) + ingresosReales - gastosReales;
  const riesgoAlto = cajaViva < 0;
  
  // Función para formatear a pesos chilenos
  const formatoCLP = (valor: number) => new Intl.NumberFormat('es-CL').format(valor);

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-gray-50/50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
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

      {/* Aumentamos el max-w para aprovechar mejor las pantallas grandes */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {riesgoAlto && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Tu caja está en negativo</h4>
              <p className="text-sm opacity-90">Tus gastos reales han superado tu saldo inicial y tus ingresos. Necesitas inyectar liquidez urgentemente.</p>
            </div>
          </div>
        )}

        {/* ESTRUCTURA PRINCIPAL DIVIDIDA EN 4 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            {/* Hacemos que el formulario se quede "pegado" (sticky) al hacer scroll */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600" />
                Registrar Movimiento
              </h3>
              
              <form action={agregarTransaccion} className="flex flex-col gap-4">
                <input type="hidden" name="negocio_id" value={negocio.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors">
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                  <input name="monto" type="number" required min="1" placeholder="Ej: 25.000" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                  <input name="descripcion" type="text" required placeholder="Ej: Arriendo, Luz..." className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
                </div>
                
                <button type="submit" className="w-full mt-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Guardar Movimiento
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            
            {/* 1. Fila de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Wallet size={16} />
                  <h3 className="text-sm font-medium">Caja Disponible</h3>
                </div>
                <p className={`text-4xl font-bold ${cajaViva >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  ${formatoCLP(cajaViva)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                 <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <ArrowUpCircle size={16} className="text-green-600" />
                  <h3 className="text-sm font-medium">Total Ingresado</h3>
                </div>
                <p className="text-3xl font-semibold text-gray-900">${formatoCLP(ingresosReales)}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                 <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <ArrowDownCircle size={16} className="text-red-600" />
                  <h3 className="text-sm font-medium">Total Gastado</h3>
                </div>
                <p className="text-3xl font-semibold text-gray-900">${formatoCLP(gastosReales)}</p>
              </div>
            </div>

            {/* 2. Fila de Gráficos */}
            <GraficosFinancieros transacciones={txs} />

            {/* 3. Fila Inferior Dividida */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Mitad Izquierda: Lista de Movimientos */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                {/* Añadimos flex justify-between items-center para separar el título del botón */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Últimos Movimientos</h3>
                  <BotonExportarExcel transacciones={txs} />
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {txs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No tienes movimientos aún. Registra tu primer ingreso o gasto.
                    </div>
                  ) : (
                    txs.map((tx: any) => (
                      <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {tx.tipo === 'ingreso' ? (
                            <div className="p-2 bg-green-50 rounded-full text-green-600"><ArrowUpCircle size={16} /></div>
                          ) : (
                            <div className="p-2 bg-red-50 rounded-full text-red-600"><ArrowDownCircle size={16} /></div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tx.descripcion}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.tipo === 'ingreso' ? '+' : '-'}${formatoCLP(Number(tx.monto))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mitad Derecha: Excel, Simulador y API */}
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