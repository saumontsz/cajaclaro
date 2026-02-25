'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * CREAR NEGOCIO INICIAL (Onboarding)
 */
export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Obtener el usuario autenticado (ej: vía Google)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No se encontró una sesión activa." }

  // 2. Extraer datos del formulario
  const nombre = formData.get('nombre') as string
  const saldo_actual = Number(formData.get('saldo_actual'))
  const ingresos_mensuales = Number(formData.get('ingresos_mensuales'))
  const tipo_perfil = formData.get('tipo_perfil') as string

  if (!nombre) return { error: "El nombre es obligatorio." }

  // 3. Insertar el negocio
  // Se incluye 'tipo_uso' para evitar el error de columna faltante
  const { data: nuevoNegocio, error: insertError } = await supabase
    .from('negocios')
    .insert([
      { 
        user_id: user.id, 
        nombre, 
        saldo_actual, 
        ingresos_mensuales,
        plan: 'gratis',
        tipo_uso: tipo_perfil 
      }
    ])
    .select()
    .single()

  if (insertError) {
    console.error("Error al crear negocio:", insertError.message)
    return { error: `Error de base de datos: ${insertError.message}` }
  }

  // 4. LIMPIEZA CRÍTICA DE CACHÉ
  // revalidatePath('/', 'layout') obliga a Next.js a refrescar todos los permisos
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard')

  // 5. Redirección final
  redirect('/dashboard')
}

/**
 * CERRAR SESIÓN (Salida de emergencia)
 */
export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}