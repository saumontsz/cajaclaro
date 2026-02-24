'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, ArrowRight, TrendingUp, ShieldCheck, Zap, BarChart3, 
  Check, Sun, Moon, ChevronDown, Star, Users 
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [anual, setAnual] = useState(false)
  
  // Lógica de tema oscuro integrada
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
      setIsDark(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* BARRA DE NAVEGACIÓN */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl group">
            <Activity size={24} className="group-hover:scale-110 transition-transform" />
            <span>Flujent</span>
          </Link>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-500/20 active:scale-95">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* SECCIÓN PRINCIPAL (HERO) */}
        <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={16} className="text-purple-500" />
            <span>El motor financiero para tu negocio</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Tus números claros.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400">
              Tu futuro asegurado.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Deja de adivinar si llegarás a fin de mes. Simula escenarios de riesgo y descubre exactamente cuánto tiempo de vida tiene tu emprendimiento.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group hover:scale-105">
              Crear mi cuenta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#precios" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-semibold rounded-xl transition-all flex items-center justify-center hover:scale-105">
              Ver planes
            </Link>
          </div>
        </section>

        {/* SECCIÓN DEMO VISUAL (NUEVO) */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="relative rounded-3xl border-4 md:border-8 border-slate-900/5 dark:border-slate-800 bg-slate-900 shadow-2xl overflow-hidden aspect-video mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              {/* Placeholder para cuando tengas la captura real */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center group cursor-default">
                <div className="text-center space-y-6 p-8">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                      <BarChart3 size={40} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Control Inteligente</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Aquí iría una captura de pantalla de tu nuevo Dashboard. <br/>
                      <span className="text-xs uppercase tracking-wider font-bold text-blue-500 mt-2 block">Vista Previa</span>
                    </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE CARACTERÍSTICAS */}
        <section className="py-24 bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Todo lo que necesitas, nada que no</h2>
              <p className="text-slate-600 dark:text-slate-400">Herramientas de nivel empresarial, simplificadas para ti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck size={24} />} 
                title="Simulador de Riesgo" 
                desc="Anticípate a las crisis. Descubre cuántos meses de cobertura tienes si tus ingresos caen sorpresivamente."
                color="blue"
              />
              <FeatureCard 
                icon={<TrendingUp size={24} />} 
                title="Control de Flujo" 
                desc="Registra tus gastos e ingresos fácilmente. Observa tu crecimiento en gráficos analíticos claros."
                color="green"
              />
              <FeatureCard 
                icon={<BarChart3 size={24} />} 
                title="Soberanía de Datos" 
                desc="Importa tu historial desde Excel en segundos, y exporta tus reportes financieros con un solo clic."
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN TESTIMONIOS (NUEVO) */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">
              Emprendedores que duermen tranquilos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                nombre="Camila Soto"
                rol="Dueña de Cafetería"
                texto="Antes no sabía si llegaba a fin de mes. Con el simulador, pude prever una baja en ventas y ajustar mis compras a tiempo."
              />
              <TestimonialCard 
                nombre="Javier M."
                rol="Freelancer TI"
                texto="Lo que más me gusta es la simplicidad. No soy contador, y Flujent me habla en mi idioma. Sé cuánto puedo gastar."
              />
              <TestimonialCard 
                nombre="Andrés V."
                rol="Pyme de Logística"
                texto="Pasamos de 4 Excels desordenados a una sola fuente de verdad. La proyección de flujo de caja es increíblemente precisa."
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN DE PRECIOS */}
        <section id="precios" className="py-24 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Planes simples, sin letras chicas</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Comienza gratis y mejora cuando tu negocio lo necesite.</p>
            
            {/* Toggle Mensual / Anual */}
            <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-800 w-fit mx-auto shadow-sm">
              <button 
                onClick={() => setAnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!anual ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Mensual
              </button>
              <button 
                onClick={() => setAnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${anual ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Anual <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">AHORRA 17%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* PLAN PERSONAL (Azul) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Plan Personal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ideal para freelancers y control de finanzas personales.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ${anual ? '59.900' : '5.990'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/ {anual ? 'año' : 'mes'}</span>
                {anual && <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">Equivale a $4.991 al mes</p>}
              </div>
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {[
                  'Control de ingresos y gastos',
                  'Simulador de riesgo financiero',
                  'Gráficos analíticos',
                  'Importación y exportación de Excel',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <Check size={20} className="text-blue-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/login?plan=personal&ciclo=${anual ? 'anual' : 'mensual'}`} className="w-full py-3.5 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-center font-bold rounded-xl transition-colors">
                Comenzar con Personal
              </Link>
            </div>

            {/* PLAN EMPRESA (Púrpura) */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 border border-slate-800 relative shadow-2xl shadow-purple-900/20 flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Recomendado
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Plan Empresa</h3>
                <p className="text-sm text-slate-400">Para Pymes que buscan automatización total y liquidez proyectada.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  ${anual ? '199.900' : '19.990'}
                </span>
                <span className="text-slate-400 font-medium">/ {anual ? 'año' : 'mes'}</span>
                {anual && <p className="text-sm text-purple-400 mt-2 font-medium">Equivale a $16.658 al mes</p>}
              </div>
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {[
                  'Todo lo del Plan Personal',
                  'Llave API Secreta',
                  'Automatización con Zapier y Shopify',
                  'Múltiples negocios (Próximamente)'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Check size={20} className="text-purple-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/login?plan=empresa&ciclo=${anual ? 'anual' : 'mensual'}`} className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-center font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30">
                Seleccionar Empresa
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN FAQ (NUEVO) */}
        <section className="py-20 bg-gray-50 dark:bg-slate-900/30">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-4">
              <FaqItem 
                pregunta="¿Necesito conocimientos de contabilidad?"
                respuesta="Para nada. Flujent está diseñado para dueños de negocios, no para contadores. Usamos lenguaje simple: 'Entra dinero', 'Sale dinero'."
              />
              <FaqItem 
                pregunta="¿Mis datos están seguros?"
                respuesta="Absolutamente. Usamos encriptación de nivel bancario y tus datos se alojan en servidores seguros. Nadie, ni siquiera nosotros, tiene acceso a leer tus movimientos."
              />
              <FaqItem 
                pregunta="¿Puedo cancelar en cualquier momento?"
                respuesta="Sí. No hay contratos forzosos. Puedes cancelar tu suscripción desde el panel de control con un solo clic y tendrás acceso hasta que termine tu ciclo pagado."
              />
              <FaqItem 
                pregunta="¿Sirve para cumplir con el SII?"
                respuesta="Flujent es una herramienta de gestión interna y proyecciones, no reemplaza tu contabilidad tributaria, pero ayuda a ordenarla para tu contador."
              />
            </div>
          </div>
        </section>

      </main>
      
      {/* PIE DE PÁGINA */}
      <footer className="py-12 text-center border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-900 dark:text-white font-bold">
           <Activity size={20} /> Flujent
        </div>
        <p className="text-slate-500 dark:text-slate-600 text-sm">© {new Date().getFullYear()} Flujent. Hecho en Chile para emprendedores con visión.</p>
      </footer>
    </div>
  )
}

// --- SUBCOMPONENTES ---

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'blue' | 'green' | 'purple' }) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  }
  
  return (
    <div className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ nombre, rol, texto }: { nombre: string, rol: string, texto: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 relative shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-1 mb-4 text-yellow-400">
        {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-6 relative z-10 italic leading-relaxed">
        "{texto}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <Users size={18} className="text-slate-500" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{nombre}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{rol}</p>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ pregunta, respuesta }: { pregunta: string, respuesta: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
      >
        {pregunta}
        <ChevronDown size={20} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-gray-100 dark:border-slate-900 pt-4">
          {respuesta}
        </div>
      </div>
    </div>
  )
}