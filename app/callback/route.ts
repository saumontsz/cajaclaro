import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // El enlace del correo viene con algo como: ?code=abc-123...
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si hay un parámetro "next", lo usamos para redirigir allí después
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Intercambiamos el código temporal por una sesión real
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Si todo sale bien, mandamos al usuario al Dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, lo mandamos al login con un error
  return NextResponse.redirect(`${origin}/login?message=No se pudo verificar el correo`)
}