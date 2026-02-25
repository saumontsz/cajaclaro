'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Loader2, AlertCircle } from 'lucide-react'
import { login } from './actions' // Asegúrate de que login esté aquí
import { createClient } from '@/utils/supabase/client' 

function GoogleButton({ disabled }: { disabled: boolean }) {
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled || loadingGoogle}
      // CORRECCIÓN DARK MODE: Fondos oscuros y bordes sutiles
      className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-2xl font-bold text-sm text-slate-700 dark:text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.99] shadow-sm"
    >
      {loadingGoogle ? (
        <Loader2 className="animate-spin text-slate-400" size={20} />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Continuar con Google</span>
        </>
      )}
    </button>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const errorUrl = searchParams.get('error')
  const messageUrl = searchParams.get('message')

  const handleEmailLogin = async (formData: FormData) => {
    setLoading(true)
    await login(formData)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center bg-blue-600 w-12 h-12 rounded-xl shadow-lg shadow-blue-600/20 mb-4 hover:scale-105 transition-transform">
          <LayoutDashboard className="text-white" size={24} />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Bienvenido a Flujent
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
          Inicia sesión para gestionar tu negocio.
        </p>
      </div>

      {/* CORRECCIÓN DARK MODE: Tarjeta con fondo oscuro y bordes adaptados */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        
        <div className="mb-6">
          <GoogleButton disabled={loading} />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-widest transition-colors">
              o con tu correo
            </span>
          </div>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Correo electrónico</label>
            {/* CORRECCIÓN DARK MODE: Inputs oscuros con texto claro */}
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="tu@email.com" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400" 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm transition-all placeholder:text-slate-400" 
            />
          </div>

          {(errorUrl || messageUrl) && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              errorUrl 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
            }`}>
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorUrl || messageUrl}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-3 mt-2">
            <button 
              formAction={handleEmailLogin} 
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Iniciar sesión'}
            </button>
            
            <div className="text-center pt-2">
              {/* ENLACE REAL A LA PAGINA DE REGISTRO */}
              <Link 
                href="/register" 
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors font-medium"
              >
                ¿No tienes cuenta? <span className="underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2 hover:decoration-slate-500">Regístrate aquí</span>
              </Link>
            </div>
          </div>
        </form>
      </div>

      <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-xs mx-auto leading-relaxed">
        Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      <Suspense fallback={<div className="text-blue-600"><Loader2 className="animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}