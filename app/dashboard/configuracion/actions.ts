'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 1. ACTUALIZAR NOMBRE DEL NEGOCIO
 */
export async function actualizarNegocio(formData: FormData) {
  const supabase = await createClient()
  const nombre = formData.get('nombre') as string
  const negocioId = formData.get('negocio_id') as string

  if (!nombre || !negocioId) return { error: 'Faltan datos' }

  const { error } = await supabase
    .from('negocios')
    .update({ nombre })
    .eq('id', negocioId)

  if (error) return { error: 'Error actualizando negocio: ' + error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/configuracion')
  return { success: 'Nombre actualizado correctamente' }
}

/**
 * 2. CANCELAR SUSCRIPCIÓN (Lógica Netflix)
 * No cambia el plan a gratis inmediato, solo cancela la renovación.
 */
export async function cancelarPlan(negocioId: string) {
  const supabase = await createClient()
  
  // 1. Buscamos tu columna 'fecha_expiracion' para saber hasta cuándo tiene acceso
  const { data: negocio } = await supabase
    .from('negocios')
    .select('fecha_expiracion') 
    .eq('id', negocioId)
    .single()

  // Si no tiene fecha (ej. es un demo nuevo), le damos 30 días para no romper la lógica visual
  let fechaFin = negocio?.fecha_expiracion
  if (!fechaFin) {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + 30)
    fechaFin = hoy.toISOString()
  }

  // 2. Actualizamos el estado y aseguramos la fecha
  // Es vital que tengas la columna 'estado_suscripcion' en tu tabla
  const { error } = await supabase
    .from('negocios')
    .update({ 
      estado_suscripcion: 'cancelada', 
      fecha_expiracion: fechaFin       
    })
    .eq('id', negocioId)

  if (error) return { error: 'No se pudo cancelar el plan: ' + error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/configuracion')
  return { success: 'La renovación automática ha sido desactivada.' }
}

/**
 * 3. CAMBIAR CONTRASEÑA
 */
export async function actualizarPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password !== confirm) return { error: 'Las contraseñas no coinciden' }
  if (password.length < 6) return { error: 'La contraseña es muy corta (mínimo 6 caracteres)' }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  
  return { success: 'Contraseña actualizada correctamente' }
}