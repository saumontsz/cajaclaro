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
export async function importarMasivo(negocioId: string, datosExcel: any[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuario no autenticado' };

  // 2. Mapeo "A prueba de balas"
  const transaccionesLimpias = datosExcel.map((fila) => {
    let concepto = 'Sin descripción';
    let monto = 0;
    let tipoStr = 'ingreso';

    // Recorremos todas las columnas de esta fila para encontrar las coincidencias
    for (const key in fila) {
      // Limpiamos el nombre de la columna (minúsculas y sin espacios)
      const nombreColumna = key.toLowerCase().trim();

      // Si el nombre de la columna contiene "concepto" o "descrip"
      if (nombreColumna.includes('concepto') || nombreColumna.includes('descrip')) {
        concepto = String(fila[key]);
      }
      // Si la columna contiene "monto" o "valor"
      else if (nombreColumna.includes('monto') || nombreColumna.includes('valor')) {
        monto = Number(fila[key]);
      }
      // Si la columna contiene "tipo"
      else if (nombreColumna.includes('tipo')) {
        tipoStr = String(fila[key]).toLowerCase();
      }
    }

    return {
      negocio_id: negocioId,
      user_id: user.id,
      descripcion: concepto,
      monto: Math.abs(monto || 0), // Nos aseguramos de que sea positivo
      tipo: tipoStr.includes('gasto') || tipoStr.includes('egreso') ? 'gasto' : 'ingreso',
    };
  });

  // 3. Insertamos a la base de datos
  const { error } = await supabase
    .from('transacciones')
    .insert(transaccionesLimpias);

  if (error) {
    console.error("Error importando:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
export async function guardarHito(negocioId: string, nombre: string, costo: number, ahorro: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuario no autenticado' };

  const { error } = await supabase.from('hitos').insert([{
    negocio_id: negocioId,
    user_id: user.id,
    nombre,
    costo,
    ahorro
  }]);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
}

export async function borrarHito(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('hitos').delete().eq('id', id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
}
export async function generarApiKey(negocioId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Generamos una llave aleatoria con un prefijo profesional
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const nuevaApiKey = `flujent_live_${randomString}`;

  const { error } = await supabase
    .from('negocios')
    .update({ api_key: nuevaApiKey })
    .eq('id', negocioId)
    .eq('user_id', user.id); // Seguridad extra

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
}