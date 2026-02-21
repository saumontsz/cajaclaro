import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { crearNegocio, cerrarSesion, agregarTransaccion } from './actions'
import { Activity, LogOut, Wallet, Calendar, AlertTriangle, ArrowUpCircle, ArrowDownCircle, PlusCircle } from 'lucide-react'
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
    // VISTA: Formulario inicial (igual que antes)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configura tu negocio</h2>
          <p className="text-sm text-gray-500 mb-6">Ingresa tus números actuales para empezar a proyectar.</p>
          <form action={crearNegocio} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
              <input name="nombre" type="text" required placeholder="Ej: Mi Complejo Deportivo" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caja Inicial ($)</label>
              <input name="saldo_actual" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* Mantenemos estos campos estáticos como base de proyección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos promedio esperados ($)</label>
              <input name="ingresos_mensuales" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos Fijos Base ($)</label>
                <input name="gastos_fijos" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos Variables Base ($)</label>
                <input name="gastos_variables" type="number" required placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Guardar configuración
            </button>
          </form>
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
  
  // La caja viva: Saldo inicial + lo que entró - lo que salió
  const cajaViva = Number(negocio.saldo_actual) + ingresosReales - gastosReales;
  
  // Balance neto histórico (cuánto dinero real has generado o perdido desde que usas la app)
  const balanceNeto = ingresosReales - gastosReales;

  const riesgoAlto = cajaViva < 0;

  return (
    <div className="min-h-screen flex flex-col pb-12">
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
        
        {riesgoAlto && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Tu caja está en negativo</h4>
              <p className="text-sm opacity-90">Tus gastos reales han superado tu saldo inicial y tus ingresos. Necesitas inyectar liquidez urgentemente.</p>
            </div>
          </div>
        )}

        {/* KPIs Dinámicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Wallet size={16} />
              <h3 className="text-sm font-medium">Caja Disponible</h3>
            </div>
            <p className={`text-3xl font-bold ${cajaViva >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ${cajaViva}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 text-gray-500 mb-2">
              <ArrowUpCircle size={16} className="text-green-600" />
              <h3 className="text-sm font-medium">Total Ingresado</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900">${ingresosReales}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 text-gray-500 mb-2">
              <ArrowDownCircle size={16} className="text-red-600" />
              <h3 className="text-sm font-medium">Total Gastado</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900">${gastosReales}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario de Transacciones */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600" />
                Registrar Movimiento
              </h3>
              
              <form action={agregarTransaccion} className="flex flex-col gap-4">
                <input type="hidden" name="negocio_id" value={negocio.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                  <input name="monto" type="number" required min="1" placeholder="Ej: 25000" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                  <input name="descripcion" type="text" required placeholder="Ej: Arriendo de cancha, Mantenimiento..." className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <button type="submit" className="w-full mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Guardar Movimiento
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Historial y Simulador */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Lista de Movimientos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Últimos Movimientos</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
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
                        {tx.tipo === 'ingreso' ? '+' : '-'}${tx.monto}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Simulador (Le pasamos los datos actualizados) */}
            <Simulador 
              negocio={{
                saldo_actual: cajaViva, // Usamos la caja real para la simulación
                ingresos_mensuales: negocio.ingresos_mensuales,
                gastos_fijos: negocio.gastos_fijos,
                gastos_variables: negocio.gastos_variables
              }} 
            />

          </div>
        </div>
      </main>
    </div>
  )
}