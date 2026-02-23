export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si faltan las llaves (común durante el build), lanzamos un error descriptivo
  // o manejamos el caso para que no rompa la ejecución estática
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing')
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Ignorado en componentes estáticos */ }
        },
      },
    }
  )
}