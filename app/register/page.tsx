'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Activity, Loader2, ArrowLeft } from 'lucide-react' // 🚀 Usamos Activity para el logo
import { createClient } from '@/utils/supabase/client' 

function GoogleRegisterButton({ disabled }: { disabled: boolean }) {
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
      className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-2xl font-bold text-sm text-slate-700 dark:text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.99] shadow-sm hover:shadow-md"
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
          <span className="text-base">Continuar con Google</span>
        </>
      )}
    </button>
  )
}

function RegisterContent() {
  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-8 transition-colors pl-1 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al inicio
      </Link>

      <div className="text-center mb-8">
        {/* 🚀 LOGO DE FLUJENT */}
        <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-2xl group mb-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
             <Activity className="text-white" size={24} />
          </div>
          <span>Flujent</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Crea tu cuenta gratis
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
          Únete a Flujent en segundos. Sin contraseñas que recordar.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        
        <div className="flex flex-col gap-4">
          <GoogleRegisterButton disabled={false} />
          
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Términos y Condiciones
            </Link> 
            {' y '}
            <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Política de Privacidad
            </Link>.
          </p>
        </div>

      </div>
      
      <p className="mt-8 text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
        ¿Ya usas Flujent? <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Inicia sesión aquí</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50/50 dark:bg-slate-950 transition-colors">
      <Suspense fallback={<div className="text-blue-600"><Loader2 className="animate-spin" /></div>}>
        <RegisterContent />
      </Suspense>
    </main>
  )
}