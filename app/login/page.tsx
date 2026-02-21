import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
// AQUÍ ESTÁ LA CORRECCIÓN: Usamos los nombres reales del backend
import { login, signup } from './actions' 
import { Activity, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import SocialLogins from './SocialLogins'

export default async function LoginPage({ searchParams }: { searchParams: { message: string, error?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-500 font-bold text-2xl mb-2">
            <Activity size={28} />
            <span>CajaClaro</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Accede a tu cuenta</h2>
          <p className="text-slate-400 text-sm mt-2">Controla tus finanzas y proyecta tu futuro.</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-950/50 border border-slate-800">
          
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo electrónico</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="tu@email.com" 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all" 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all" 
              />
            </div>

            {searchParams?.message && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                searchParams.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                <AlertCircle size={16} className="shrink-0" />
                <span>{searchParams.message}</span>
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-2">
              {/* AQUÍ ESTÁ LA CORRECCIÓN: formAction={login} */}
              <button formAction={login} className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                Iniciar sesión
              </button>
              {/* AQUÍ ESTÁ LA CORRECCIÓN: formAction={signup} */}
              <button formAction={signup} className="w-full px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all border border-slate-700 active:scale-[0.98]">
                Crear cuenta nueva
              </button>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-4 text-slate-500 font-medium tracking-wider">O continúa con</span>
            </div>
          </div>

          <SocialLogins />

        </div>
      </div>
    </main>
  )
}