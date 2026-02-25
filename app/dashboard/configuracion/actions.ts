'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. ACTUALIZAR NEGOCIO
export async function actualizarNegocio(formData: FormData) {
  const supabase = await createClient()
  const nombre = formData.get('nombre') as string
  const negocioId = formData.get('negocio_id') as string

  if (!nombre || !negocioId) return { error: 'Faltan datos' }

  const { error } = await supabase
    .from('negocios')
    .update({ nombre })
    .eq('id', negocioId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/configuracion')
  return { success: 'Nombre actualizado' }
}

// 2. CANCELAR PLAN (La que falta en tu error)
export async function cancelarPlan(negocioId: string) {
  const supabase = await createClient()
  
  const { data: negocio } = await supabase
    .from('negocios')
    .select('fecha_expiracion') 
    .eq('id', negocioId)
    .single()

  let fechaFin = negocio?.fecha_expiracion || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('negocios')
    .update({ 
      estado_suscripcion: 'cancelada', 
      fecha_expiracion: fechaFin       
    })
    .eq('id', negocioId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/configuracion')
  return { success: 'Renovación desactivada' }
}

// 3. ACTUALIZAR CONTRASEÑA
export async function actualizarPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password !== confirm) return { error: 'Las contraseñas no coinciden' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  
  return { success: 'Contraseña actualizada' }
}