'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { login, signup } from './actions'
import SocialLogins from './SocialLogins'

// 1. Extraemos toda la lógica a un componente interno
function LoginForm() {
  const searchParams = useSearchParams()
  
  // Estados visuales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [successMessage, setSuccessMessage] = useState(false)

  // Recuperamos la "Memoria de Compra" de la URL
  const planDestino = searchParams.get('plan')
  const cicloDestino = searchParams.get('ciclo')
  const message = searchParams.get('message')

  // Manejador del Login
  const handleLogin = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    // Pasamos los params extra manualmente a la Server Action
    await login(formData, planDestino, cicloDestino)
  }

  // Manejador del Registro
  const handleSignup = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(false)

    // Llamamos a la acción de registro
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
        <Link href="/" className="inline-flex items-center gap-2 text-blue-500 font-bold text-2xl mb-2">
          <Activity size={28} />
          <span>Flujent</span>
        </Link>
        
        <h2 className="text-2xl font-bold text-white">
          {successMessage 
            ? '¡Revisa tu correo!' 
            : (planDestino ? 'Crea tu cuenta para continuar' : 'Accede a tu cuenta')}
        </h2>
        
        <p className="text-slate-400 text-sm mt-2">
          {successMessage
            ? 'Te hemos enviado un enlace mágico para entrar.'
            : (planDestino 
                ? `Estás a un paso de activar el Plan ${planDestino === 'empresa' ? 'Empresa' : 'Personal'}.` 
                : 'Controla tus finanzas y proyecta tu futuro.')}
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-950/50 border border-slate-800 transition-all duration-300">
        {successMessage ? (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in">
            <div className="bg-green-500/10 p-4 rounded-full mb-4">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <p className="text-slate-300 text-center text-sm mb-6 leading-relaxed">
              Hemos enviado un correo de confirmación. <br/>
              Haz clic en el enlace para activar tu cuenta y acceder a Flujent.
            </p>
            <button 
              onClick={() => setSuccessMessage(false)}
              className="text-sm text-slate-500 hover:text-white underline"
            >
              Volver al formulario
            </button>
          </div>
        ) : (
          <>
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
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all" 
                />
              </div>

              {(error || message) && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error || message}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  formAction={handleLogin} 
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Iniciar sesión'}
                </button>
                
                <button 
                  formAction={handleSignup} 
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium rounded-xl transition-all border border-slate-700 active:scale-[0.98] flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Crear cuenta nueva'}
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
          </>
        )}
      </div>
    </div>
  )
}

// 2. Componente Principal que exportamos (El envoltorio Suspense)
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
      <Suspense fallback={<div className="text-white"><Loader2 className="animate-spin" /> Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}