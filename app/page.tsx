'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image' 
import { 
  Activity, ArrowRight, TrendingUp, ShieldCheck, Zap, BarChart3, 
  Check, Sun, Moon, ChevronDown, Star, Users, Landmark, Lock, Sparkles, User, Building2
} from "lucide-react"; // 🚀 IMPORTACIONES COMPLETAS Y CORREGIDAS
import Link from "next/link";

export default function LandingPage() {
  const [anual, setAnual] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Lógica de tema oscuro (Persistencia y detección)
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

  // Subcomponentes para tarjetas
  const FeatureCard = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'blue' | 'green' | 'purple' }) => {
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

  const TestimonialCard = ({ nombre, rol, texto }: { nombre: string, rol: string, texto: string }) => (
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

  const FaqItem = ({ pregunta, respuesta }: { pregunta: string, respuesta: string }) => {
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

  // TABLA DE CARACTERÍSTICAS (Sincronizada con el Backend)
  const caracteristicas = [
    { nombre: "Registro de movimientos manuales", gratis: true, personal: true, empresa: true },
    { nombre: "Cuentas bancarias / Bolsillos", gratis: "1", personal: "Hasta 5", empresa: "Ilimitadas" },
    { nombre: "Cálculo de Supervivencia y Gráficos", gratis: true, personal: true, empresa: true },
    { nombre: "Simulador de Inversiones (Hitos)", gratis: "1 Meta", personal: "Ilimitadas", empresa: "Ilimitadas" },
    { nombre: "Suscripciones y Recurrentes", gratis: false, personal: true, empresa: true },
    { nombre: "Exportación a Excel", gratis: false, personal: true, empresa: true },
    { nombre: "Importación Masiva de Excel", gratis: false, personal: false, empresa: true },
    { nombre: "Acceso API REST", gratis: false, personal: false, empresa: true },
  ]

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
        {/* HERO */}
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
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group hover:scale-105">
              Crear mi cuenta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#precios" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-semibold rounded-xl transition-all flex items-center justify-center hover:scale-105">
              Ver planes
            </Link>
          </div>
        </section>

        {/* DEMO VISUAL */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="relative rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden mx-auto transform hover:scale-[1.01] transition-transform duration-500 group">
              <div className="block dark:hidden">
                <Image src="/dashboard claro.png" alt="Flujent Dashboard Claro" width={1400} height={900} priority className="w-full h-auto object-cover" />
              </div>
              <div className="hidden dark:block">
                <Image src="/dashboard oscuro.png" alt="Flujent Dashboard Oscuro" width={1400} height={900} priority className="w-full h-auto object-cover" />
              </div>
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-[32px] pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* CARACTERÍSTICAS */}
        <section className="py-24 bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Todo lo que necesitas, nada que no</h2>
              <p className="text-slate-600 dark:text-slate-400">Herramientas de nivel empresarial, simplificadas para ti.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<ShieldCheck size={24} />} title="Simulador de Riesgo" desc="Anticípate a las crisis. Descubre cuántos meses de cobertura tienes si tus ingresos caen." color="blue" />
              <FeatureCard icon={<TrendingUp size={24} />} title="Control de Flujo" desc="Registra tus gastos e ingresos fácilmente. Observa tu crecimiento en gráficos claros." color="green" />
              <FeatureCard icon={<BarChart3 size={24} />} title="Soberanía de Datos" desc="Importa tu historial desde Excel en segundos y exporta reportes con un solo clic." color="purple" />
            </div>
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">Emprendedores que duermen tranquilos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard nombre="Camila Soto" rol="Dueña de Cafetería" texto="Antes no sabía si llegaba a fin de mes. Con Flujent pude prever una baja en ventas y ajustar mis compras." />
              <TestimonialCard nombre="Javier M." rol="Freelancer TI" texto="Lo que más me gusta es la simplicidad. Sé cuánto dinero personal tengo separado de mis proyectos." />
              <TestimonialCard nombre="Andrés V." rol="Pyme de Logística" texto="Pasamos de Excels desordenados a una sola fuente de verdad. La proyección de flujo es increíble." />
            </div>
          </div>
        </section>

        {/* SECCIÓN DE PRECIOS */}
        <section id="precios" className="py-24 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Planes simples, sin letras chicas</h2>
            
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
                Anual <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold tracking-normal animate-pulse">2 MESES GRATIS</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
            {/* Semilla */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl"><Zap size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Semilla</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 h-8">Para iniciar tu orden personal.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-400 text-xs font-bold uppercase ml-1">/ mes</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-sm font-medium">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-slate-400" /> 1 Cuenta activa</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-slate-400" /> Registro manual</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-slate-400" /> Gráficos básicos</li>
              </ul>
              <Link href="/login" className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-white text-center font-bold text-sm rounded-xl">Empezar Gratis</Link>
            </div>

            {/* Personal */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-blue-500 shadow-2xl md:scale-105 z-10 flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md">Más Popular</span>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><User size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 h-8">Control total de tu patrimonio y proyecciones.</p>
              <div className="mb-8 tabular-nums">
                <span className="text-5xl font-extrabold text-blue-600">${anual ? '49.900' : '4.990'}</span>
                <span className="text-slate-400 text-xs font-bold uppercase ml-1">/ {anual ? 'año' : 'mes'}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-sm font-medium">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-blue-500" /> 5 Cuentas activas</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-blue-500" /> Simulador de Hitos</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-blue-500" /> Movimientos Recurrentes</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-blue-500" /> Exportación a Excel</li>
              </ul>
              <Link href="/login" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all">Seleccionar</Link>
            </div>

            {/* Empresa */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 flex flex-col relative shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md tracking-wider"><Sparkles size={12}/> Business</span>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Building2 size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empresa</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 h-8">Automatización pura, importación masiva y API REST.</p>
              <div className="mb-8 tabular-nums">
                <span className="text-5xl font-extrabold text-purple-600 dark:text-purple-400">${anual ? '149.900' : '14.990'}</span>
                <span className="text-slate-400 text-xs font-bold uppercase ml-1">/ {anual ? 'año' : 'mes'}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-sm font-medium">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-purple-500" /> Cuentas Ilimitadas</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-purple-500" /> Importación de Excel</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-purple-500" /> Acceso API</li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Check size={16} className="text-purple-500" /> Categorización Pro</li>
              </ul>
              <Link href="/login" className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-center font-bold text-sm rounded-xl transition-all hover:opacity-90">Seleccionar</Link>
            </div>
          </div>

          {/* TABLA COMPARATIVA CON CANDADOS PRO 🔒 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-16">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Comparativa de Poder</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-5 px-6 font-bold text-slate-500 w-2/5 text-[10px] uppercase tracking-widest">Características Clave</th>
                    <th className="py-5 px-6 font-bold text-slate-900 dark:text-white text-center w-1/5">Semilla</th>
                    <th className="py-5 px-6 font-bold text-blue-600 dark:text-blue-400 text-center w-1/5">Personal</th>
                    <th className="py-5 px-6 font-bold text-purple-600 dark:text-purple-400 text-center w-1/5">Empresa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {caracteristicas.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{item.nombre}</td>
                      
                      <td className="py-4 px-6 text-center text-[13px] font-bold text-slate-500">
                        {typeof item.gratis === 'string' ? item.gratis : (item.gratis ? <Check size={18} className="mx-auto text-slate-400" /> : <Lock size={14} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                      </td>
                      <td className="py-4 px-6 text-center text-[13px] font-bold text-blue-600 dark:text-blue-400">
                        {typeof item.personal === 'string' ? item.personal : (item.personal ? <Check size={18} className="mx-auto text-blue-500" /> : <Lock size={14} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                      </td>
                      <td className="py-4 px-6 text-center text-[13px] font-bold text-purple-600 dark:text-purple-400">
                        {typeof item.empresa === 'string' ? item.empresa : (item.empresa ? <Check size={18} className="mx-auto text-purple-500" /> : <Lock size={14} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-50 dark:bg-slate-900/30">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Dudas frecuentes</h2>
            <div className="space-y-4 text-left">
              <FaqItem pregunta="¿Necesito conocimientos de contabilidad?" respuesta="Para nada. Flujent está diseñado para dueños de negocios y personas naturales. Usamos lenguaje simple sin términos complejos." />
              <FaqItem pregunta="¿Mis datos están seguros?" respuesta="Absolutamente. Flujent utiliza tecnología PostgreSQL con cifrado de grado bancario (AES-256) gestionado por Supabase." />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 text-center border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-900 dark:text-white font-bold">
           <Activity size={20} /> Flujent
        </div>
        <p className="text-slate-500 dark:text-slate-600 text-sm">© {new Date().getFullYear()} Flujent. Hecho en Chile para emprendedores.</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">Términos</Link>
        </div>
      </footer>
    </div>
  )
}