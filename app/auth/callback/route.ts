import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si hay un error provisto por el proveedor (ej: el usuario canceló)
  const error = searchParams.get('error')
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    
    // Canjeamos el código secreto de Google por una sesión en Supabase
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si todo sale bien, lo mandamos al panel de control
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Si algo falla o no hay código, lo devolvemos al login con un error
  return NextResponse.redirect(`${origin}/login?error=No se pudo autenticar tu cuenta`)
}