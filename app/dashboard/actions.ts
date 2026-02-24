'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 1. GESTIÓN DE NEGOCIOS (Onboarding)
 */
export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const nombre = formData.get('nombre') as string
  // Obtenemos el tipo de perfil del input hidden, si falla ponemos 'personal'
  const tipo_uso = (formData.get('tipo_perfil') as string) || 'personal'
  
  const saldo_actual = Number(formData.get('saldo_actual'))
  const ingresos_mensuales = Number(formData.get('ingresos_mensuales'))
  
  // Si estos campos no vienen en el form simplificado, asumimos 0
  const gastos_fijos = Number(formData.get('gastos_fijos') || 0)
  const gastos_variables = Number(formData.get('gastos_variables') || 0)

  if (!nombre) return { error: "El nombre es obligatorio" }

  const { error } = await supabase.from('negocios').insert({
    user_id: user.id,
    nombre,
    tipo_uso, // Guardamos si es Personal o Empresa
    saldo_actual,
    ingresos_mensuales,
    gastos_fijos,
    gastos_variables,
    plan: 'gratis' // Plan inicial por defecto
  })

  if (error) {
    console.error("Error guardando el negocio:", error)
    return { error: "No se pudo crear el negocio: " + error.message }
  }

  // Refrescamos y mandamos al dashboard
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * 2. GESTIÓN DE TRANSACCIONES (Manual - Simplificada)
 */
export async function agregarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const tipo = formData.get('tipo') as 'ingreso' | 'gasto'
  const monto = Number(formData.get('monto'))
  const descripcion = formData.get('descripcion') as string
  const negocio_id = formData.get('negocio_id') as string
  const fecha = (formData.get('fecha') as string) || new Date().toISOString()

  // --- LÓGICA DE SIMPLIFICACIÓN ---
  // Ya no obligamos al usuario a elegir categoría.
  // Si no viene categoría, asignamos una por defecto según el tipo.
  let categoria = formData.get('categoria') as string
  
  if (!categoria) {
    categoria = tipo === 'ingreso' ? 'Ventas' : 'Operativo'
  }

  if (!monto || monto <= 0 || !descripcion) {
    return { error: 'Datos inválidos. Por favor revisa el monto y la descripción.' }
  }

  const { error } = await supabase.from('transacciones').insert({
    negocio_id,
    user_id: user.id,
    tipo,
    monto,
    descripcion,
    categoria, // Se guarda la automática o la manual si existiera
    created_at: fecha // Usamos la fecha del form o la actual
  })

  if (error) {
    console.error("Error guardando transacción:", error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * 3. IMPORTACIÓN MASIVA (Excel)
 */
export async function importarMasivo(negocioId: string, datosExcel: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuario no autenticado' };

  // Mapeo inteligente para detectar columnas de cualquier Excel
  const transaccionesLimpias = datosExcel.map((fila) => {
    let concepto = 'Sin descripción';
    let monto = 0;
    let tipoStr = 'ingreso';

    for (const key in fila) {
      const nombreColumna = key.toLowerCase().trim();
      if (nombreColumna.includes('concepto') || nombreColumna.includes('descrip')) {
        concepto = String(fila[key]);
      } else if (nombreColumna.includes('monto') || nombreColumna.includes('valor') || nombreColumna.includes('importe')) {
        monto = Number(fila[key]);
      } else if (nombreColumna.includes('tipo')) {
        tipoStr = String(fila[key]).toLowerCase();
      }
    }

    const tipoFinal = tipoStr.includes('gasto') || tipoStr.includes('egreso') ? 'gasto' : 'ingreso';

    return {
      negocio_id: negocioId,
      user_id: user.id,
      descripcion: concepto,
      monto: Math.abs(monto || 0),
      tipo: tipoFinal,
      // Asignamos categoría automática también en el Excel
      categoria: tipoFinal === 'ingreso' ? 'Ventas' : 'Operativo'
    };
  });

  const { error } = await supabase.from('transacciones').insert(transaccionesLimpias);

  if (error) {
    console.error("Error en importación masiva:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 4. GESTIÓN DE HITOS (Proyectos de inversión)
 */
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
  return { success: true };
}

export async function borrarHito(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('hitos').delete().eq('id', id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 5. CONFIGURACIÓN API (Plan Empresa)
 */
export async function generarApiKey(negocioId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const nuevaApiKey = `flujent_live_${randomString}`;

  const { error } = await supabase
    .from('negocios')
    .update({ api_key: nuevaApiKey })
    .eq('id', negocioId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}