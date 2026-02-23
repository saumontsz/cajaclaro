import { createServerClient } from '@supabase/ssr'
// ESTA ES LA LÍNEA QUE FALTA:
import { cookies } from 'next/headers' 

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validación de seguridad para que el build no falle si no detecta las llaves
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing')
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}