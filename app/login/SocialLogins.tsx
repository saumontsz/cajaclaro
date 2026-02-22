'use client'

import { FcGoogle } from 'react-icons/fc'
import { FaApple, FaMicrosoft } from 'react-icons/fa'
import { MdPhoneIphone } from 'react-icons/md'
import { createClient } from '../../utils/supabase/client'

export default function SocialLogins() {
  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure') => {
    
    const supabase = createClient()
  if (!supabase) return; // Si no hay cliente, no hacemos nada

  const baseUrl = window.location.origin
    
    
    // Llamamos a Supabase para que inicie el flujo con el proveedor
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // A donde vuelve Google después de verificar al usuario
        redirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (error) {
      alert(`Error al conectar con ${provider}: ${error.message}`)
    }
  }

  const buttonClasses = "w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white font-medium transition-all duration-200 shadow-sm active:scale-[0.98]"

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Activamos el botón de Google */}
      <button onClick={() => handleSocialLogin('google')} type="button" className={buttonClasses}>
        <FcGoogle size={22} />
        <span>Continuar con Google</span>
      </button>
      
      {/* Activamos Apple 
      <button onClick={() => handleSocialLogin('apple')} type="button" className={buttonClasses}>
        <FaApple size={22} className="text-white" />
        <span>Continuar con Apple</span>
      </button>*/}

      {/* Activamos Microsoft (Azure) 
      <button onClick={() => handleSocialLogin('azure')} type="button" className={buttonClasses}>
        <FaMicrosoft size={20} className="text-blue-400" />
        <span>Continuar con Microsoft</span>
      </button>*/}
      
      {/*<button onClick={() => alert('Próximamente: Login con SMS')} type="button" className={buttonClasses}>
        <MdPhoneIphone size={22} className="text-slate-300" />
        <span>Continuar con el teléfono</span>
      </button>*/}
    </div>
  )
}