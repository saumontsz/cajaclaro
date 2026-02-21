import { Activity, ArrowRight, TrendingUp, Clock, DollarSign, Receipt, PlayCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import ImportadorExcel from './ImportadorExcel'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navegación */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg tracking-tight">
            <Activity className="text-blue-600" size={24} />
            <span>CajaClaro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/login" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            
            {/* Texto y Botones */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
                <CheckCircle size={14} className="text-blue-600" /> Para microemprendedores
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                ¿Cuánto tiempo de vida le queda a tu <span className="text-blue-600 relative inline-block">negocio?<span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100 -z-10 rounded-sm"></span></span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                La mayoría de los emprendimientos fallan por falta de caja. CajaClaro te da la respuesta clara y ordenada sin hojas de cálculo complicadas.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30">
                  Empezar ahora <ArrowRight size={18} />
                </Link>
                <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <PlayCircle size={18} className="text-gray-500" /> Ver demo
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                <CheckCircle size={14} className="text-gray-400" /> Sin tarjeta de crédito requerida
              </p>
            </div>

            {/* Visualización de Tarjetas (Dashboard Mockup) CON ANIMACIÓN HOVER */}
            <div className="relative group perspective-1000">
              {/* Fondo decorativo de las tarjetas que reacciona al hover */}
              <div className="absolute top-4 left-4 right-0 bottom-0 bg-gray-200/50 rounded-3xl -z-10 transform rotate-2 transition-transform duration-500 group-hover:rotate-3 group-hover:translate-x-2 group-hover:translate-y-2"></div>
              
              {/* Contenedor principal de las tarjetas */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl relative z-10 transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-[1.02] group-hover:shadow-2xl">
                
                {/* Tarjeta Principal: Vida Estimada */}
                <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-colors duration-300 group-hover:bg-blue-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={14} /> Vida Estimada (Runway)
                    </h3>
                    <TrendingUp size={18} className="text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">8.5</span>
                    <span className="text-xl text-gray-600 font-medium">meses</span>
                  </div>
                  {/* Barra de progreso simulada con animación de carga ligera al hover */}
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2 relative">
                    <div className="h-full bg-blue-500 rounded-full absolute left-0 top-0 transition-all duration-1000 ease-out w-[70%] group-hover:w-[75%]"></div>
                  </div>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <TrendingUp size={14} /> +1.2 meses vs mes pasado
                  </p>
                </div>

                {/* Tarjetas Secundarias: Ingresos y Gastos */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Ingresos */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden transition-transform duration-500 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <DollarSign size={20} />
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h4 className="text-sm text-gray-500 mb-1">Ingresos Abril</h4>
                    <p className="text-2xl font-bold text-gray-900">$4,250.00</p>
                  </div>

                  {/* Gastos Fijos */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-transform duration-500 hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600 inline-block">
                        <Receipt size={20} />
                      </div>
                    </div>
                    <h4 className="text-sm text-gray-500 mb-1">Gastos Fijos</h4>
                    <p className="text-2xl font-bold text-gray-900">$1,120.00</p>
                    {/* Gráfico de barras simulado */}
                    <div className="flex items-end gap-1 mt-3 h-6">
                      <div className="flex-1 bg-red-200 rounded-sm h-2/3 transition-all duration-300 group-hover:h-3/4"></div>
                      <div className="flex-1 bg-red-200 rounded-sm h-1/2 transition-all duration-300 group-hover:h-3/5 delay-75"></div>
                      <div className="flex-1 bg-red-100 rounded-sm h-1/3 transition-all duration-300 group-hover:h-2/5 delay-100"></div>
                      <div className="flex-1 bg-red-500 rounded-sm h-full transition-all duration-300 group-hover:h-[90%] delay-150"></div>
                      <div className="flex-1 bg-red-200 rounded-sm h-2/5 transition-all duration-300 group-hover:h-1/2 delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Diseñado para tomar decisiones rápidas</h2>
              <p className="text-gray-500 max-w-xl mx-auto">No necesitas ser contador. Te damos exactamente los indicadores que determinan si tu negocio sobrevive o quiebra.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow hover:bg-white hover:border-blue-100 group">
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Caja Viva Dinámica</h3>
                <p className="text-gray-600 leading-relaxed">Olvida los ingresos fijos irreales. Registra tus ventas diarias y ve cómo tu liquidez real y margen operativo se calculan al instante.</p>
              </div>
              
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow hover:bg-white hover:border-blue-100 group">
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Simulador de Estrés</h3>
                <p className="text-gray-600 leading-relaxed">¿Qué pasa si llueve y caen las reservas un 20%? Activa el simulador y descubre al instante si tu caja aguanta para pagar los costos fijos.</p>
              </div>

              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow hover:bg-white hover:border-blue-100 group">
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  <Activity className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatización API</h3>
                <p className="text-gray-600 leading-relaxed">Conecta tu web de reservas, Shopify o pasarela de pagos. Los ingresos entrarán solos a tu flujo de caja mientras tú duermes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Precios simples y transparentes</h2>
              <p className="text-gray-500">Comienza a controlar tus números gratis. Automatiza cuando crezcas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Plan Gratis */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Manual</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500 font-medium">/mes</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-blue-600" /> Registro manual de movimientos</li>
                  <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-blue-600" /> Simulador de escenarios</li>
                  <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-blue-600" /> Cálculo de días de supervivencia</li>
                </ul>
                <Link href="/login" className="w-full py-3 px-4 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-colors text-center">
                  Crear cuenta gratis
                </Link>
              </div>

              {/* Plan Premium */}
              <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col relative overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recomendado
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Automático</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-white">$15</span>
                  <span className="text-gray-400 font-medium">/mes</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-yellow-400" /> <strong className="text-white">Todo lo del plan Gratis</strong></li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-yellow-400" /> Acceso a la API secreta</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-yellow-400" /> Integración con Zapier / Webhooks</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={18} className="text-yellow-400" /> Ingreso automático de dinero</li>
                </ul>
                <Link href="/login" className="w-full py-3 px-4 bg-yellow-400 text-yellow-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors text-center shadow-lg shadow-yellow-400/20">
                  Subir a Automático
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-900 font-bold text-lg mb-4">
          <Activity className="text-blue-600" size={20} /> CajaClaro
        </div>
        <p className="text-gray-500 text-sm">Finanzas claras para emprendedores reales. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}