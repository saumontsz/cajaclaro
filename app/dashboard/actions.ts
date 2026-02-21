'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const nombre = formData.get('nombre') as string
  const saldo_actual = Number(formData.get('saldo_actual'))
  const ingresos_mensuales = Number(formData.get('ingresos_mensuales'))
  const gastos_fijos = Number(formData.get('gastos_fijos'))
  const gastos_variables = Number(formData.get('gastos_variables'))

  // Validación básica
  if (!nombre) return 

  const { error } = await supabase.from('negocios').insert({
    user_id: user.id,
    nombre,
    saldo_actual,
    ingresos_mensuales,
    gastos_fijos,
    gastos_variables
    // Nota: 'plan' y 'api_key' se crearán solos gracias a los DEFAULT que pusimos en SQL
  })

  if (error) {
    console.error("Error guardando el negocio:", error)
    return 
  }

  // ESTA ES LA LÍNEA MÁGICA QUE FALTABA
  revalidatePath('/dashboard')
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
export async function agregarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const tipo = formData.get('tipo') as 'ingreso' | 'gasto'
  const monto = Number(formData.get('monto'))
  const descripcion = formData.get('descripcion') as string
  const negocio_id = formData.get('negocio_id') as string

  // Validación básica: Si hay error, simplemente cancelamos la ejecución (return void)
  if (!monto || monto <= 0 || !descripcion) {
    console.error('Datos inválidos')
    return 
  }

  const { error } = await supabase.from('transacciones').insert({
    negocio_id,
    user_id: user.id,
    tipo,
    monto,
    descripcion
  })

  // Si falla la base de datos, cancelamos la ejecución (return void)
  if (error) {
    console.error("Error guardando transacción:", error)
    return 
  }

  revalidatePath('/dashboard')
}
export async function importarTransaccionesMasivas(transacciones: any[], negocio_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // Preparamos los datos con el ID del usuario y negocio correctos
  const datosFormateados = transacciones.map(tx => ({
    negocio_id,
    user_id: user.id,
    tipo: String(tx.tipo).toLowerCase() === 'ingreso' ? 'ingreso' : 'gasto',
    monto: Number(tx.monto),
    descripcion: String(tx.descripcion),
    // Si el Excel trae fecha la usamos, si no, usa la fecha de hoy
    fecha: tx.fecha ? new Date(tx.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }))

  // Insertamos todo de golpe (Bulk Insert)
  const { error } = await supabase.from('transacciones').insert(datosFormateados)

  if (error) {
    console.error("Error en importación masiva:", error)
    return { error: 'Error al guardar los datos en la base de datos' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}