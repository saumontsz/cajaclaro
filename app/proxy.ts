import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Ahora usamos "export default" como exige la nueva versión
export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - Archivos estáticos (_next/static, _next/image, favicon.ico)
     * - Imágenes (.svg, .png, .jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}