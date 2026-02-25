'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * FUNCIÓN AUXILIAR: Conversión de fechas de Excel
 * Interpreta strings, fechas de JS y el formato numérico serial de Excel (ej: 45336).
 */
function convertirFechaExcel(excelDate: any) {
  const fechaProvisional = new Date(excelDate);
  if (!isNaN(fechaProvisional.getTime())) return fechaProvisional.toISOString();

  if (typeof excelDate === 'number') {
    // Excel cuenta los días desde el 30/12/1899
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * 1. GESTIÓN DE NEGOCIOS (Onboarding)
 */
export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const nombre = formData.get('nombre') as string
  const tipo_uso = (formData.get('tipo_perfil') as string) || 'personal'
  const saldo_actual = Number(formData.get('saldo_actual'))
  const ingresos_mensuales = Number(formData.get('ingresos_mensuales'))
  
  const gastos_fijos = Number(formData.get('gastos_fijos') || 0)
  const gastos_variables = Number(formData.get('gastos_variables') || 0)

  if (!nombre) return { error: "El nombre es obligatorio" }

  const { error } = await supabase.from('negocios').insert({
    user_id: user.id,
    nombre,
    tipo_uso, 
    saldo_actual,
    ingresos_mensuales,
    gastos_fijos,
    gastos_variables,
    plan: 'gratis' 
  })

  if (error) {
    console.error("Error guardando el negocio:", error)
    return { error: "No se pudo crear el negocio: " + error.message }
  }

  revalidatePath('/', 'layout') 
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

/**
 * CIERRE DE SESIÓN
 */
export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout') 
  redirect('/')
}

/**
 * 2. GESTIÓN DE TRANSACCIONES (Manual)
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

  let categoria = formData.get('categoria') as string
  if (!categoria) {
    categoria = tipo === 'ingreso' ? 'Ventas' : 'Operativo'
  }

  if (!monto || monto <= 0 || !descripcion) {
    return { error: 'Datos inválidos. Revisa el monto y la descripción.' }
  }

  const { error } = await supabase.from('transacciones').insert({
    negocio_id,
    user_id: user.id,
    tipo,
    monto,
    descripcion,
    categoria,
    created_at: fecha
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * 3. IMPORTACIÓN MASIVA (Excel)
 * Mejorado con filtros anti-basura y mapeo de fechas históricas.
 */
export async function importarMasivo(negocioId: string, datosExcel: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuario no autenticado' };

  // 1. FILTRADO: Ignoramos filas que parezcan cálculos de resumen o estén vacías
  const transaccionesLimpias = datosExcel
    .filter((fila) => {
      const contenido = JSON.stringify(fila).toLowerCase();
      // Si la fila tiene palabras como total o promedio, la descartamos para evitar duplicados
      return !contenido.includes('total') && !contenido.includes('promedio') && !contenido.includes('resumen');
    })
    .map((fila) => {
      let concepto = 'Sin descripción';
      let monto = 0;
      let tipoStr = 'ingreso';
      let fechaFinal = new Date().toISOString();

      for (const key in fila) {
        const nombreColumna = key.toLowerCase().trim();
        const valor = fila[key];

        // Detección de Fecha (Compatible con meses anteriores)
        if (nombreColumna.includes('fecha') || nombreColumna.includes('date') || nombreColumna.includes('dia')) {
          fechaFinal = convertirFechaExcel(valor);
        } 
        // Detección de Concepto
        else if (nombreColumna.includes('concepto') || nombreColumna.includes('descrip') || nombreColumna.includes('detalle')) {
          concepto = String(valor);
        } 
        // Detección de Monto (Limpia $, puntos y espacios)
        else if (nombreColumna.includes('monto') || nombreColumna.includes('valor') || nombreColumna.includes('importe')) {
          const montoLimpio = String(valor).replace(/[$. ]/g, '').replace(',', '.');
          monto = Math.abs(parseFloat(montoLimpio) || 0);
        } 
        // Detección de Tipo
        else if (nombreColumna.includes('tipo')) {
          tipoStr = String(valor).toLowerCase();
        }
      }

      const tipoFinal = tipoStr.includes('gasto') || tipoStr.includes('egreso') ? 'gasto' : 'ingreso';

      return {
        negocio_id: negocioId,
        user_id: user.id,
        descripcion: concepto,
        monto: monto,
        tipo: tipoFinal,
        categoria: tipoFinal === 'ingreso' ? 'Ventas' : 'Operativo',
        created_at: fechaFinal
      };
    })
    .filter(t => t.monto > 0); // Solo subimos transacciones con valor real

  if (transaccionesLimpias.length === 0) return { error: 'No se encontraron datos válidos para importar.' };

  const { error } = await supabase.from('transacciones').insert(transaccionesLimpias);

  if (error) {
    console.error("Error en importación masiva:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 4. GESTIÓN DE HITOS
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
 * 5. CONFIGURACIÓN API
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