'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const datos = {
    user_id: user.id,
    nombre: formData.get('nombre') as string,
    saldo_actual: Number(formData.get('saldo_actual')),
    ingresos_mensuales: Number(formData.get('ingresos_mensuales')),
    gastos_fijos: Number(formData.get('gastos_fijos')),
    gastos_variables: Number(formData.get('gastos_variables')),
  }

  const { error } = await supabase.from('negocios').insert(datos)

  if (error) {
    console.error("Error guardando negocio:", error)
    return
  }

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