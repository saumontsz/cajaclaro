import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, Zap, Building2, User, Sparkles } from 'lucide-react'

export default async function PlanesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  // Normalizamos el plan actual
  const planRaw = (negocio?.plan || 'gratis').toLowerCase()
  let planActual = 'gratis'
  if (['pyme', 'negocio', 'empresa', 'pro_empresa'].includes(planRaw)) planActual = 'empresa'
  else if (['personal', 'pro'].includes(planRaw)) planActual = 'personal'

  const caracteristicas = [
    { nombre: "Registro de movimientos manuales", gratis: true, personal: true, empresa: true },
    { nombre: "Cálculo de Supervivencia y Gráficos", gratis: true, personal: true, empresa: true },
    { nombre: "Exportación de datos a Excel", gratis: false, personal: true, empresa: true },
    { nombre: "Simulador de Proyecciones e Hitos", gratis: false, personal: true, empresa: true },
    { nombre: "Importación Masiva desde Excel", gratis: false, personal: false, empresa: true },
    { nombre: "Acceso API y Webhooks", gratis: false, personal: false, empresa: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      
      {/* HEADER SIMPLE */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Volver al Panel
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Sube el nivel de tus finanzas
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a ti. Cancela en cualquier momento.
          </p>
        </div>

        {/* TARJETAS DE PRECIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Plan Gratis */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'gratis' ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'} flex flex-col`}>
            {planActual === 'gratis' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">Tu plan actual</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg"><Zap size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Semilla</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">Para dar los primeros pasos en tu orden financiero.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-8">$0 <span className="text-sm font-normal text-slate-400">/mes</span></p>
            
            <button disabled className={`mt-auto w-full py-3 rounded-xl font-bold transition-all ${planActual === 'gratis' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'}`}>
              {planActual === 'gratis' ? 'Plan Activo' : 'Comenzar Gratis'}
            </button>
          </div>

          {/* Plan Personal */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'personal' ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'} flex flex-col`}>
            {planActual === 'personal' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">Tu plan actual</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><User size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Pro</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">Analiza tu patrimonio y proyecta tu liquidez.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-8">$5.990 <span className="text-sm font-normal text-slate-400">/mes</span></p>
            
            <button disabled={planActual === 'personal'} className={`mt-auto w-full py-3 rounded-xl font-bold transition-all ${planActual === 'personal' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95'}`}>
              {planActual === 'personal' ? 'Plan Activo' : 'Mejorar a Personal'}
            </button>
          </div>

          {/* Plan Empresa */}
          <div className={`relative bg-white dark:bg-slate-900 p-8 rounded-3xl border ${planActual === 'empresa' ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-purple-200 dark:border-purple-900/50'} flex flex-col ring-1 ring-purple-500/20`}>
            {planActual === 'empresa' ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">Tu plan actual</span>
            ) : (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1"><Sparkles size={12}/> Más Popular</span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Building2 size={20} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empresa Pro</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">El CFO de tu negocio. Automatiza e importa datos masivos.</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-8">$20.000 <span className="text-sm font-normal text-slate-400">/mes</span></p>
            
            <button disabled={planActual === 'empresa'} className={`mt-auto w-full py-3 rounded-xl font-bold transition-all ${planActual === 'empresa' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/20 active:scale-95'}`}>
              {planActual === 'empresa' ? 'Plan Activo' : 'Mejorar a Empresa'}
            </button>
          </div>

        </div>

        {/* TABLA COMPARATIVA */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Compara los beneficios</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-5 px-6 font-semibold text-slate-500 w-2/5">Características</th>
                  <th className="py-5 px-6 font-bold text-slate-900 dark:text-white text-center w-1/5">Semilla</th>
                  <th className="py-5 px-6 font-bold text-blue-600 dark:text-blue-400 text-center w-1/5">Personal</th>
                  <th className="py-5 px-6 font-bold text-purple-600 dark:text-purple-400 text-center w-1/5">Empresa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {caracteristicas.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">{item.nombre}</td>
                    
                    {/* Columna Gratis */}
                    <td className="py-4 px-6 text-center">
                      {typeof item.gratis === 'boolean' ? (
                        item.gratis ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-slate-300 dark:text-slate-700" />
                      ) : <span className="text-sm text-slate-500">{item.gratis}</span>}
                    </td>

                    {/* Columna Personal */}
                    <td className="py-4 px-6 text-center">
                      {typeof item.personal === 'boolean' ? (
                        item.personal ? <Check size={18} className="mx-auto text-blue-500" /> : <X size={18} className="mx-auto text-slate-300 dark:text-slate-700" />
                      ) : <span className="text-sm text-slate-500">{item.personal}</span>}
                    </td>

                    {/* Columna Empresa */}
                    <td className="py-4 px-6 text-center">
                      {typeof item.empresa === 'boolean' ? (
                        item.empresa ? <Check size={18} className="mx-auto text-purple-500" /> : <X size={18} className="mx-auto text-slate-300 dark:text-slate-700" />
                      ) : <span className="text-sm text-slate-500">{item.empresa}</span>}
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