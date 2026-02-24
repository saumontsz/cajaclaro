'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function crearPrimerNegocio(formData: FormData) {
  const supabase = await createClient()

  // 1. Verificar usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener datos del formulario
  const nombre = formData.get('nombre') as string
  const tipo = formData.get('tipo') as string // 'personal' o 'empresa'
  
  // Generamos un slug simple (url-amigable) basado en el nombre
  const slug = nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000)

  // 3. Insertar en Supabase
  // IMPORTANTE: Inicializamos el plan como 'gratis' y fecha_expiracion en null
  const { error } = await supabase.from('negocios').insert({
    user_id: user.id,
    nombre: nombre,
    slug: slug,
    plan: 'gratis', // Todos empiezan gratis hasta que paguen
    tipo_uso: tipo, // Asegúrate de tener esta columna o úsala para lógica interna
    fecha_expiracion: null 
  })

  if (error) {
    console.error('Error creando negocio:', error)
    return { error: error.message }
  }

  // 4. Redirigir al Dashboard si todo sale bien
  revalidatePath('/dashboard')
  redirect('/dashboard')
}