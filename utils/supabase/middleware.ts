import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const path = request.nextUrl.pathname

  //OPTIMIZACIÓN 1: Si no es dashboard, login o raíz, ni siquiera preguntamos a la DB
  if (!path.startsWith('/dashboard') && path !== '/login' && path !== '/') {
    return supabaseResponse
  }

  // Obtenemos el usuario (aquí ocurre la latencia)
  const { data: { user } } = await supabase.auth.getUser()

  //Regla 1: Protección de Dashboard
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  //Regla 2: Redirección de usuarios logeados (Evita que el dashboard parpadee)
  if (user && (path === '/login' || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}