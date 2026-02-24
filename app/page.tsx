'use client'

import { useState, useEffect } from 'react'
import { Activity, ArrowRight, TrendingUp, ShieldCheck, Zap, BarChart3, Check, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [anual, setAnual] = useState(false)
  
  // Lógica de tema oscuro integrada para evitar errores de importación
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Detectar preferencia del sistema o guardada
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* BARRA DE NAVEGACIÓN */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl">
            <Activity size={24} />
            <span>Flujent</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Botón de Tema Integrado */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800/50">
            <Zap size={16} className="text-purple-500" />
            <span>El motor financiero para tu negocio</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Tus números claros.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400">
              Tu futuro asegurado.
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Controla tus ingresos, simula escenarios de riesgo y descubre exactamente cuánto tiempo de vida tiene tu emprendimiento. Todo en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group">
              Crear mi cuenta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#precios" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-semibold rounded-xl transition-all flex items-center justify-center">
              Ver planes
            </Link>
          </div>
        </section>

        {/* SECCIÓN DE CARACTERÍSTICAS */}
        <section className="py-20 bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Diseñado para la tranquilidad mental</h2>
              <p className="text-slate-600 dark:text-slate-400">Herramientas de nivel empresarial, simplificadas para emprendedores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Simulador de Riesgo</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Anticípate a las crisis. Descubre cuántos meses de cobertura tienes si tus ingresos caen sorpresivamente.</p>
              </div>

              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Control de Flujo</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Registra tus gastos e ingresos fácilmente. Observa tu crecimiento en gráficos analíticos avanzados.</p>
              </div>

              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Soberanía de Datos</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Importa tu historial desde Excel en segundos, y exporta tus reportes financieros con un solo clic.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE PRECIOS */}
        <section id="precios" className="py-24 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Planes simples, sin letras chicas</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Comienza gratis y mejora cuando tu negocio lo necesite.</p>
            
            {/* Toggle Mensual / Anual */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${!anual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Mensual</span>
              <button 
                onClick={() => setAnual(!anual)}
                className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600 dark:bg-purple-600 transition-colors focus:outline-none"
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${anual ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-semibold flex items-center gap-2 ${anual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                Anual <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">2 meses gratis</span>
              </span>
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

      </main>
      
      {/* PIE DE PÁGINA */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-600 text-sm border-t border-gray-200 dark:border-slate-800">
        <p>© {new Date().getFullYear()} Flujent. Hecho en Chile para emprendedores con visión.</p>
      </footer>
    </div>
  )
}