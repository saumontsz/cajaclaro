'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * ==========================================
 * 🔒 GUARDIA DE PLANES (SaaS CORE)
 * ==========================================
 */
async function obtenerPlan(supabase: any, negocioId: string) {
  const { data } = await supabase.from('negocios').select('plan').eq('id', negocioId).single();
  return data?.plan || 'gratis';
}

/**
 * 1. UTILIDADES DE CONVERSIÓN
 */
function convertirFechaExcel(excelDate: any) {
  const fechaProvisional = new Date(excelDate);
  if (!isNaN(fechaProvisional.getTime())) return fechaProvisional.toISOString();
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString();
  }
  return new Date().toISOString();
}

/**
 * 2. GESTIÓN DE NEGOCIOS Y CUENTAS
 */
export async function crearNegocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const nombre = formData.get('nombre') as string
  const saldo_actual = Number(formData.get('saldo_actual'))

  const { data: nuevoNegocio, error: negocioError } = await supabase
    .from('negocios')
    .insert({
      user_id: user.id,
      nombre,
      tipo_uso: (formData.get('tipo_perfil') as string) || 'personal', 
      saldo_actual,
      plan: 'gratis' // 🚀 Por defecto nacen gratis
    })
    .select()
    .single()

  if (negocioError) return { error: "Error al crear negocio: " + negocioError.message }

  await supabase.from('cuentas').insert({
    negocio_id: nuevoNegocio.id,
    user_id: user.id,
    nombre: 'Cuenta Principal',
    saldo_inicial: nuevoNegocio.saldo_actual, 
    tipo: 'otros'
  })

  revalidatePath('/', 'layout') 
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// 🚀 NUEVO: Función segura para crear cuentas extras (Bloqueada por plan)
// 🚀 Función segura para crear cuentas con límites por plan
export async function crearCuentaNueva(negocioId: string, nombre: string, saldo: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificamos el plan
  const plan = await obtenerPlan(supabase, negocioId);
  
  // Contamos cuántas cuentas tiene actualmente
  const { count } = await supabase.from('cuentas').select('*', { count: 'exact', head: true }).eq('negocio_id', negocioId);
  const cuentasActuales = count || 0;

  // 🔒 REGLAS DE LÍMITES
  if (plan === 'gratis' && cuentasActuales >= 1) {
    return { error: 'El plan Gratis permite 1 sola cuenta. Actualiza a Personal (5) o Empresa (Ilimitadas). 👑' };
  }
  
  if (plan === 'personal' && cuentasActuales >= 5) {
    return { error: 'Tu plan Personal alcanzó el límite de 5 cuentas. Actualiza a Empresa para tener cuentas ilimitadas. 👑' };
  }

  const { error } = await supabase.from('cuentas').insert({
    negocio_id: negocioId, user_id: user.id, nombre, saldo_inicial: saldo, tipo: 'banco'
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}
/**
 * 3. IMPORTACIÓN MASIVA (ETL FINANCIERO ROBUSTO v5 - MULTICUENTA) 📊
 * Soporta Excels que mezclan múltiples tarjetas/bancos y mapea categorías correctas sin importar tildes.
 */
export async function importarMasivo(negocioId: string, datosExcel: any[], cuentaIdForzada?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // 🔒 BLOQUEO SAAS
  const plan = await obtenerPlan(supabase, negocioId);
  if (plan === 'gratis') return { error: 'La importación de Excel es exclusiva del plan Empresa. 👑' };

  // 1. CARGAMOS LAS CUENTAS EXISTENTES EN MEMORIA (Caché rápido)
  const { data: cuentasDB } = await supabase.from('cuentas').select('id, nombre').eq('negocio_id', negocioId);
  const mapaCuentas = new Map<string, string>();
  cuentasDB?.forEach(c => mapaCuentas.set(c.nombre.toLowerCase().trim(), c.id));

  // Función interna para encontrar o crear cuentas al vuelo fila por fila
  async function obtenerOCrearCuenta(nombreBase: string) {
    const nombreLimpio = nombreBase.toLowerCase().trim();
    if (mapaCuentas.has(nombreLimpio)) return mapaCuentas.get(nombreLimpio);

    const { data: nuevaCuenta } = await supabase.from('cuentas').insert({
      negocio_id: negocioId, user_id: user.id, nombre: nombreBase, saldo_inicial: 0, tipo: 'banco'
    }).select('id').single();

    if (nuevaCuenta) mapaCuentas.set(nombreLimpio, nuevaCuenta.id);
    return nuevaCuenta?.id;
  }

  // 2. DETECCIÓN GLOBAL (Fallback si no especifican cuenta por fila)
  let bancoGlobalDetectado = 'Cuenta Principal';
  const contenidoRaw = JSON.stringify(datosExcel).toLowerCase();
  if (contenidoRaw.includes('banco de chile')) bancoGlobalDetectado = 'Banco de Chile';
  else if (contenidoRaw.includes('santander')) bancoGlobalDetectado = 'Santander';
  else if (contenidoRaw.includes('bice')) bancoGlobalDetectado = 'BICE';
  else if (contenidoRaw.includes('estado')) bancoGlobalDetectado = 'Banco Estado';

  const transaccionesLimpias: any[] = [];
  const filasDescartadas: { fila: number, motivo: string, datos: any }[] = [];

  const datosFiltrados = datosExcel.filter(fila => {
    const raw = JSON.stringify(fila).toLowerCase();
    return !raw.includes('total') && !raw.includes('resumen') && !raw.includes('saldo final');
  });

  // 3. PROCESAMIENTO FILA POR FILA
  for (let index = 0; index < datosFiltrados.length; index++) {
    const fila = datosFiltrados[index];
    const row: Record<string, any> = {};
    
    // 🚀 FIX: Normalizamos las llaves para borrar tildes (ej: "Categoría" -> "categoria")
    for (const key in fila) {
      const cleanKey = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      row[cleanKey] = fila[key];
    }

    // PARSEO DE NÚMEROS (Protección multi-formato)
    const parseNumber = (val: any) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      let str = String(val).trim().replace(/[$]/g, '').replace(/\s/g, ''); 
      if (str.includes('.') && str.includes(',')) {
        str = str.lastIndexOf(',') > str.lastIndexOf('.') ? str.replace(/\./g, '').replace(',', '.') : str.replace(/,/g, ''); 
      } else if (str.includes(',')) str = str.replace(',', '.');
      else if (/\.\d{3}$/.test(str)) str = str.replace(/\./g, '');
      return parseFloat(str) || 0;
    };

    const abonoKey = Object.keys(row).find(k => k.includes('abono') || k.includes('deposito') || k.includes('ingreso'));
    const cargoKey = Object.keys(row).find(k => k.includes('cargo') || k.includes('giro') || k.includes('egreso'));
    const montoUnicoKey = Object.keys(row).find(k => k.includes('monto') || k.includes('valor'));
    const tipoKey = Object.keys(row).find(k => k.includes('tipo'));
    
    const catKey = Object.keys(row).find(k => k.includes('categor'));
    const categoriaExtraida = catKey && row[catKey] ? String(row[catKey]).trim() : '';

    const valAbono = abonoKey ? parseNumber(row[abonoKey]) : 0;
    const valCargo = cargoKey ? parseNumber(row[cargoKey]) : 0;
    const valMontoUnico = montoUnicoKey ? parseNumber(row[montoUnicoKey]) : 0;
    const tipoExplicito = tipoKey ? String(row[tipoKey]).toLowerCase() : '';

    let montoBase = 0, tipoFinal = '';

    if (Math.abs(valMontoUnico) > 0) {
      montoBase = Math.abs(valMontoUnico);
      const esNeg = valMontoUnico < 0;
      if (tipoExplicito.includes('ingr') || tipoExplicito.includes('abon')) tipoFinal = esNeg ? 'gasto' : 'ingreso';
      else if (tipoExplicito.includes('gast') || tipoExplicito.includes('carg')) tipoFinal = esNeg ? 'ingreso' : 'gasto';
    } else if (Math.abs(valAbono) > 0) {
      montoBase = Math.abs(valAbono); tipoFinal = valAbono > 0 ? 'ingreso' : 'gasto';
    } else if (Math.abs(valCargo) > 0) {
      montoBase = Math.abs(valCargo); tipoFinal = valCargo > 0 ? 'gasto' : 'ingreso';
    }

    if (!tipoFinal && categoriaExtraida) {
      const c = categoriaExtraida.toLowerCase();
      if (c.includes('venta') || c.includes('sueldo')) tipoFinal = 'ingreso';
      else if (c.includes('gasto') || c.includes('arriendo') || c.includes('proveedor')) tipoFinal = 'gasto';
    }

    const numFila = index + 2;
    if (montoBase === 0 || !tipoFinal || tipoExplicito.includes('???')) {
      filasDescartadas.push({ fila: numFila, motivo: 'Datos ambiguos o incompletos', datos: fila });
      continue; 
    }

    // MAGIA MULTI-CUENTA
    let idCuentaFila = cuentaIdForzada; 
    
    if (!idCuentaFila) {
      const colCuenta = Object.keys(row).find(k => k.includes('cuenta') || k.includes('banco') || k.includes('tarjeta'));
      const nombreCuentaFila = colCuenta && row[colCuenta] ? String(row[colCuenta]).trim() : bancoGlobalDetectado;
      idCuentaFila = await obtenerOCrearCuenta(nombreCuentaFila);
    }

    transaccionesLimpias.push({
      negocio_id: negocioId, user_id: user.id, cuenta_id: idCuentaFila,
      descripcion: String(row.concepto || row.descripcion || 'Importación').substring(0, 200),
      monto: Math.round(montoBase * 100) / 100,
      tipo: tipoFinal,
      categoria: categoriaExtraida || (tipoFinal === 'ingreso' ? 'Ventas' : 'Operativo'),
      created_at: convertirFechaExcel(row.fecha)
    });
  }

  if (transaccionesLimpias.length === 0) return { error: 'Sin datos válidos', descartadas: filasDescartadas };

  const { error } = await supabase.from('transacciones').insert(transaccionesLimpias);
  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true, procesadas: transaccionesLimpias.length, descartadas: filasDescartadas };
}

/**
 * 4. TRANSACCIONES, TRASPASOS Y RECURRENCIA (Restaurado 🔄)
 */
export async function agregarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const tipo = formData.get('tipo') as string;
  const monto = Number(formData.get('monto'));
  const descripcion = formData.get('descripcion') as string;
  const negocio_id = formData.get('negocio_id') as string;
  const fechaStr = (formData.get('fecha') as string) || new Date().toISOString();

  // 🚀 LÓGICA DE TRASPASOS CON MANEJO DE ERRORES
  if (tipo === 'transferencia') {
    const cuentaOrigenId = formData.get('cuenta_origen') as string;
    const cuentaDestinoId = formData.get('cuenta_destino') as string;

    // 1. Descontamos de la cuenta origen
    const { error: err1 } = await supabase.from('transacciones').insert({
      negocio_id, user_id: user.id, cuenta_id: cuentaOrigenId, 
      tipo: 'gasto', monto, descripcion: `Traspaso a otra cuenta: ${descripcion}`, 
      categoria: 'Transferencia Interna', created_at: fechaStr
    });

    if (err1) return { error: err1.message };

    // 2. Sumamos a la cuenta destino (ej: pagando la tarjeta)
    const { error: err2 } = await supabase.from('transacciones').insert({
      negocio_id, user_id: user.id, cuenta_id: cuentaDestinoId, 
      tipo: 'ingreso', monto, descripcion: `Abono desde otra cuenta: ${descripcion}`, 
      categoria: 'Transferencia Interna', created_at: fechaStr
    });

    if (err2) return { error: err2.message };

    revalidatePath('/dashboard');
    return { success: true };
  }

  // LÓGICA NORMAL (INGRESO O GASTO REGULAR)
  const cuenta_id = formData.get('cuenta_id') as string;
  const esRecurrente = formData.get('es_recurrente') === 'true';
  const frecuencia = (formData.get('frecuencia') as string) || 'mensual';
  const categoria = (formData.get('categoria') as string) || (tipo === 'ingreso' ? 'Ventas' : 'Operativo');

  // 🔒 BLOQUEO SAAS (Recurrencia)
  if (esRecurrente) {
    const plan = await obtenerPlan(supabase, negocio_id);
    if (plan === 'gratis') return { error: 'Los movimientos recurrentes son exclusivos del plan Empresa. 👑' };
  }

  const { error: txError } = await supabase.from('transacciones').insert({
    negocio_id, user_id: user.id, cuenta_id, tipo, monto, descripcion, categoria, created_at: fechaStr
  });
  
  if (txError) return { error: txError.message };

  if (esRecurrente) {
    const fechaBase = new Date(fechaStr);
    let proxima = new Date(fechaBase);
    
    if (frecuencia === 'semanal') proxima.setDate(proxima.getDate() + 7);
    else if (frecuencia === 'mensual') proxima.setMonth(proxima.getMonth() + 1);
    else if (frecuencia === 'anual') proxima.setFullYear(proxima.getFullYear() + 1);

    await supabase.from('movimientos_recurrentes').insert({
      user_id: user.id, negocio_id, cuenta_id, tipo, monto, descripcion, frecuencia,
      proxima_ejecucion: proxima.toISOString().split('T')[0], estado: 'activo'
    });
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 5. SIMULADOR DE INVERSIÓN (HITOS) 🎯
 */
export async function guardarHito(negocioId: string, nombre: string, costo: number, ahorro: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // 🔒 BLOQUEO SAAS
  const plan = await obtenerPlan(supabase, negocioId);
  if (plan === 'gratis') {
    const { count } = await supabase.from('hitos').select('*', { count: 'exact', head: true }).eq('negocio_id', negocioId);
    if ((count || 0) >= 1) return { error: 'El plan Gratis permite solo 1 proyecto. Actualiza a Empresa. 👑' };
  }

  const { error } = await supabase.from('hitos').insert({
    user_id: user.id,
    negocio_id: negocioId,
    nombre: nombre,
    costo: costo, 
    ahorro: ahorro
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

export async function borrarHito(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('hitos').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true }; 
}

export async function toggleRecurrente(id: string, estadoActual: string) {
  const supabase = await createClient();
  const nuevo = estadoActual === 'activo' ? 'pausado' : 'activo';
  const { error } = await supabase.from('movimientos_recurrentes').update({ estado: nuevo }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true }; 
}

export async function eliminarRecurrente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('movimientos_recurrentes').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true }; 
}

/**
 * 6. SESIÓN Y API KEY
 */
export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function generarApiKey(negocioId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // 🔒 BLOQUEO SAAS API
  const plan = await obtenerPlan(supabase, negocioId);
  if (plan !== 'empresa') {
    return { error: 'El acceso a la API es una funcionalidad exclusiva del plan Empresa. 👑' };
  }

  const key = `fluj_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  const { error } = await supabase.from('negocios').update({ api_key: key }).eq('id', negocioId);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}