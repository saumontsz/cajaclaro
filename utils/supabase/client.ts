import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Verificamos que las variables existan para evitar que el build falle
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // En desarrollo, esto nos avisará si olvidamos el archivo .env
    // En el build, esto evita que se intente crear un cliente inválido
    console.warn("Faltan variables de entorno de Supabase")
    return null as any 
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}