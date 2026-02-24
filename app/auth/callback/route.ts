import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Preservar la intención de compra (si viene de Social Login)
  const plan = searchParams.get('plan')
  const ciclo = searchParams.get('ciclo')

  // Manejo de errores del proveedor
  const error = searchParams.get('error')
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    
    // 2. Canjeamos el código por la sesión
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError) {
      // 3. VERIFICACIÓN DE SEGURIDAD (Válvula de Onboarding)
      // Obtenemos el usuario recién logueado
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Buscamos si ya tiene un negocio creado
        const { data: negocio } = await supabase
          .from('negocios')
          .select('id, plan')
          .eq('user_id', user.id)
          .single()

        // ESCENARIO A: Usuario nuevo sin negocio -> A configurar
        if (!negocio) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // ESCENARIO B: Tiene negocio y venía con intención de compra -> Al Checkout
        if (plan && ciclo) {
          return NextResponse.redirect(`${origin}/checkout?plan=${plan}&ciclo=${ciclo}`)
        }

        // ESCENARIO C: Login normal -> Al Dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Fallback de error
  return NextResponse.redirect(`${origin}/login?error=No se pudo autenticar tu cuenta`)
}