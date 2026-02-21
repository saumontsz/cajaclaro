'use client'

import { FcGoogle } from 'react-icons/fc'
import { FaApple, FaMicrosoft } from 'react-icons/fa'
import { MdPhoneIphone } from 'react-icons/md'

export default function SocialLogins() {
  const handleSocialLogin = (provider: string) => {
    // AQUÍ IRA LA LÓGICA DE SUPABASE MÁS ADELANTE
    alert(`Próximamente: Iniciar sesión con ${provider}. Por ahora, usa correo y contraseña.`)
  }

  const buttonClasses = "w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white font-medium transition-all duration-200 shadow-sm active:scale-[0.98]"

  return (
    <div className="flex flex-col gap-3 w-full">
      <button onClick={() => handleSocialLogin('Google')} className={buttonClasses}>
        <FcGoogle size={22} />
        <span>Continuar con Google</span>
      </button>
      
      <button onClick={() => handleSocialLogin('Apple')} className={buttonClasses}>
        <FaApple size={22} className="text-white" />
        <span>Continuar con Apple</span>
      </button>

      <button onClick={() => handleSocialLogin('Microsoft')} className={buttonClasses}>
        <FaMicrosoft size={20} className="text-blue-400" />
        <span>Continuar con Microsoft</span>
      </button>
      
      <button onClick={() => handleSocialLogin('Teléfono')} className={buttonClasses}>
        <MdPhoneIphone size={22} className="text-slate-300" />
        <span>Continuar con el teléfono</span>
      </button>
    </div>
  )
}