'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, Zap, Building2, User, Sparkles } from 'lucide-react'

export default function PlanesPage() {
  const [anual, setAnual] = useState(false)
  const [planActual, setPlanActual] = useState('gratis')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/login')
        return
      }

      const { data: negocio } = await supabase
        .from('negocios')
        .select('plan')
        .eq('user_id', user.id)
        .single()

      const planRaw = (negocio?.plan || 'gratis').toLowerCase()
      if (['pyme', 'negocio', 'empresa', 'pro_empresa'].includes(planRaw)) setPlanActual('empresa')
      else if (['personal', 'pro'].includes(planRaw)) setPlanActual('personal')
      
      setLoading(false)
    }
    cargarDatos()
  }, [supabase])

  // 🚀 TABLA EXACTA DE CARACTERÍSTICAS (Igualada al Backend SaaS)
  const caracteristicas = [
    { nombre: "Registro de movimientos manuales", gratis: true, personal: true, empresa: true },
    { nombre: "Cuentas bancarias o bolsillos", gratis: "1", personal: "Hasta 5", empresa: "Ilimitadas" },
    { nombre: "Cálculo de Supervivencia y Gráficos", gratis: true, personal: true, empresa: true },
    { nombre: "Simulador de Inversiones (Hitos)", gratis: "1 Meta", personal: "Ilimitadas", empresa: "Ilimitadas" },
    { nombre: "Suscripciones y Movimientos Recurrentes", gratis: false, personal: true, empresa: true },
    { nombre: "Exportación de historial a Excel", gratis: false, personal: true, empresa: true },
    { nombre: "Importación Masiva Inteligente (.xlsx)", gratis: false, personal: false, empresa: true },
    { nombre: "Multi-Cuenta en un solo Excel", gratis: false, personal: false, empresa: true },
    { nombre: "Generación de API Key REST", gratis: false, personal: false, empresa: true },
  ]

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Volver al Panel
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Elige el plan ideal para tu flujo
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-bold ${!anual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Mensual</span>
            <button 
              onClick={() => setAnual(!anual)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600 transition-colors focus:outline-none"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${anual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${anual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Anual <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider">2 meses gratis</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Plan Semilla */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'gratis' ? 'border-slate-400 dark:border-slate-500 shadow-lg' : 'border-slate-200 dark:border-slate-800'} flex flex-col`}>
            {planActual === 'gratis' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Tu plan actual</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl"><Zap size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Semilla</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 h-10">Para quienes inician su orden financiero personal.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-8">$0 <span className="text-sm font-normal text-slate-400">/mes</span></p>
            
            <button disabled className="mt-auto w-full py-3.5 rounded-2xl font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed uppercase text-xs tracking-widest">
              Plan Activo
            </button>
          </div>

          {/* Plan Personal */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'personal' ? 'border-blue-500 shadow-xl shadow-blue-500/20 md:scale-105 z-10' : 'border-slate-200 dark:border-slate-800'} flex flex-col`}>
            {planActual === 'personal' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">Tu plan actual</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><User size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 h-10">Control total de tus finanzas y múltiples cuentas.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              ${anual ? '49.900' : '4.990'}
            </p>
            <p className="text-sm text-slate-400 mb-8 font-medium">/ {anual ? 'año' : 'mes'}</p>
            
            {planActual === 'personal' ? (
              <button disabled className="mt-auto w-full py-3.5 rounded-2xl font-bold transition-all bg-blue-100 dark:bg-blue-900/30 text-blue-500 cursor-not-allowed uppercase text-xs tracking-widest">
                Plan Activo
              </button>
            ) : (
              <Link 
                href={`/checkout?plan=personal&ciclo=${anual ? 'anual' : 'mensual'}`} 
                className="mt-auto w-full py-3.5 rounded-2xl font-bold transition-all text-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95 block uppercase text-xs tracking-widest"
              >
                Elegir Personal
              </Link>
            )}
          </div>

          {/* Plan Empresa */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'empresa' ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-slate-200 dark:border-slate-800'} flex flex-col`}>
            {!planActual.includes('empresa') && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md tracking-wider"><Sparkles size={12}/> Business</span>
            )}
            {planActual === 'empresa' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">Tu plan actual</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Building2 size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empresa</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 h-10">Automatización pura, importación masiva y API REST.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              ${anual ? '149.900' : '14.990'}
            </p>
            <p className="text-sm text-slate-400 mb-8 font-medium">/ {anual ? 'año' : 'mes'}</p>
            
            {planActual === 'empresa' ? (
              <button disabled className="mt-auto w-full py-3.5 rounded-2xl font-bold transition-all bg-purple-100 dark:bg-purple-900/30 text-purple-500 cursor-not-allowed uppercase text-xs tracking-widest">
                Plan Activo
              </button>
            ) : (
              <Link 
                href={`/checkout?plan=empresa&ciclo=${anual ? 'anual' : 'mensual'}`} 
                className="mt-auto w-full py-3.5 rounded-2xl font-bold transition-all text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/20 active:scale-95 block uppercase text-xs tracking-widest"
              >
                Elegir Empresa
              </Link>
            )}
          </div>

        </div>

        {/* TABLA COMPARATIVA ACTUALIZADA */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Compara los beneficios a fondo</h3>
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
                    
                    {/* Renderizado dinámico: Texto o Check/X */}
                    <td className="py-4 px-6 text-center text-[13px] font-bold text-slate-500">
                      {typeof item.gratis === 'string' ? item.gratis : (item.gratis ? <Check size={18} className="mx-auto text-emerald-500" /> : <X size={16} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                    </td>
                    <td className="py-4 px-6 text-center text-[13px] font-bold text-blue-600 dark:text-blue-400">
                      {typeof item.personal === 'string' ? item.personal : (item.personal ? <Check size={18} className="mx-auto text-emerald-500" /> : <X size={16} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                    </td>
                    <td className="py-4 px-6 text-center text-[13px] font-bold text-purple-600 dark:text-purple-400">
                      {typeof item.empresa === 'string' ? item.empresa : (item.empresa ? <Check size={18} className="mx-auto text-emerald-500" /> : <X size={16} className="mx-auto text-slate-300 dark:text-slate-700" />)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}