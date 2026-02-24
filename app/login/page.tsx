'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { login, signup } from './actions'
import SocialLogins from './SocialLogins'

function LoginForm() {
  const searchParams = useSearchParams()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [successMessage, setSuccessMessage] = useState(false)

  const planDestino = searchParams.get('plan')
  const cicloDestino = searchParams.get('ciclo')
  const message = searchParams.get('message')

  const handleLogin = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    await login(formData, planDestino, cicloDestino)
    setLoading(false)
  }

  const handleSignup = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(false)

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccessMessage(true)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
          <Activity size={28} />
          <span>Flujent</span>
        </Link>
        
        <h2 className="text-2xl font-bold text-slate-900">
          {successMessage 
            ? '¡Revisa tu correo!' 
            : (planDestino ? 'Crea tu cuenta para continuar' : 'Bienvenido de nuevo')}
        </h2>
        
        <p className="text-slate-500 text-sm mt-2">
          {successMessage
            ? 'Te hemos enviado un enlace mágico para entrar.'
            : (planDestino 
                ? `Estás a un paso de activar el Plan ${planDestino}.` 
                : 'Accede a tu panel de control.')}
        </p>
      </div>

      {/* TARJETA BLANCA LIMPIA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        {successMessage ? (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <p className="text-slate-600 text-center text-sm mb-6 leading-relaxed">
              Hemos enviado un correo de confirmación. <br/>
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <button 
              onClick={() => setSuccessMessage(false)}
              className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Volver al formulario
            </button>
          </div>
        ) : (
          <>
            <form className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Correo electrónico</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="tu@email.com" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña</label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 transition-all" 
                />
              </div>

              {(error || message) && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error || message}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  formAction={handleLogin} 
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Iniciar sesión'}
                </button>
                
                <button 
                  formAction={handleSignup} 
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 active:scale-[0.98] flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Crear cuenta nueva'}
                </button>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-wider">O continúa con</span>
              </div>
            </div>

            <SocialLogins />
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    // CAMBIO IMPORTANTE: bg-gray-50 en lugar de bg-slate-950
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Suspense fallback={<div className="text-blue-600"><Loader2 className="animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}