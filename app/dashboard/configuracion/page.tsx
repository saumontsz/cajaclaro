import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Building, CreditCard, Lock, Mail, ArrowLeft } from 'lucide-react'
import { BusinessForm, PasswordForm, PlanCard } from './ClientComponents'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Generador de Avatar con Iniciales
  const iniciales = negocio?.nombre ? negocio.nombre.substring(0, 2).toUpperCase() : 'FL'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      {/* HEADER CON BOTÓN DE RETORNO */}
      <div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">Gestiona tu perfil, tu plan y la seguridad de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PERFIL */}
        <div className="space-y-8">
          {/* Tarjeta de Perfil */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold">
              <User size={20} className="text-blue-500" />
              <h2>Mi Perfil</h2>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">
                {iniciales}
              </div>
              <p className="text-sm text-slate-500">Avatar generado automáticamente</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Mail size={16} />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIOS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Tarjeta de Negocio */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold">
              <Building size={20} className="text-purple-500" />
              <h2>Datos del Negocio</h2>
            </div>
            <BusinessForm negocio={negocio} />
          </div>

          {/* Tarjeta de Plan */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold">
              <CreditCard size={20} className="text-green-500" />
              <h2>Suscripción</h2>
            </div>
            <PlanCard negocio={negocio} />
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold">
              <Lock size={20} className="text-slate-500" />
              <h2>Seguridad</h2>
            </div>
            <PasswordForm />
          </div>

        </div>
      </div>
    </div>
  )
}