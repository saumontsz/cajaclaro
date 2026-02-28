'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * ==========================================
 * 🧠 MOTOR DE NORMALIZACIÓN E INTELIGENCIA
 * ==========================================
 */
const normalizar = (nombre: string) => {
  if (!nombre) return "";
  let n = nombre.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/g, ''); 

  const diccionarioAlias: Record<string, string> = {
    'amex': 'americanexpress',
    'scotia': 'scotiabank',
    'chile': 'bancodechile',
    'estado': 'bancoestado',
    'santander': 'bancosantander',
    'itau': 'bancoitau',
    'bci': 'bancobci'
  };

  for (const key in diccionarioAlias) {
    if (n.includes(key)) return diccionarioAlias[key];
  }
  return n;
};

async function obtenerPlan(supabase: any, negocioId: string) {
  const { data } = await supabase.from('negocios').select('plan').eq('id', negocioId).single();
  return data?.plan || 'gratis';
}

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
 * 1. GESTIÓN DE NEGOCIO Y CUENTAS
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
      plan: 'gratis'
    })
    .select().single()

  if (negocioError) return { error: negocioError.message }

  await supabase.from('cuentas').insert({
    negocio_id: nuevoNegocio.id,
    user_id: user.id,
    nombre: 'Cuenta Principal',
    saldo_inicial: saldo_actual, 
    tipo: 'otros'
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function crearCuentaNueva(negocioId: string, nombre: string, saldo: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const plan = await obtenerPlan(supabase, negocioId);
  const { count } = await supabase.from('cuentas').select('*', { count: 'exact', head: true }).eq('negocio_id', negocioId);
  const numCuentas = count || 0;

  if ((plan === 'gratis' || plan === 'semilla') && numCuentas >= 1) {
    return { error: 'El plan Gratis permite 1 sola cuenta.' };
  }

  const { error } = await supabase.from('cuentas').insert({
    negocio_id: negocioId, user_id: user.id, nombre, saldo_inicial: saldo, tipo: 'banco'
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 2. IMPORTACIÓN INTELIGENTE (Solución error 'user is null' 🛠️)
 */
export async function importarMasivo(negocioId: string, datosExcel: any[], cuentaIdForzada?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado', success: false, procesadas: 0, descartadas: [] };

  const userId = user.id; // 🚀 Capturamos el ID en una constante para asegurar el tipo string

  const { data: cuentasDB } = await supabase.from('cuentas').select('id, nombre').eq('negocio_id', negocioId);
  const mapaCuentas = new Map<string, string>();
  cuentasDB?.forEach(c => mapaCuentas.set(normalizar(c.nombre), c.id));

  // Sub-función corregida con userId explícito
  async function obtenerOCrearCuenta(nombreBase: string) {
    const nombreNorm = normalizar(nombreBase);
    if (mapaCuentas.has(nombreNorm)) return mapaCuentas.get(nombreNorm);

    const { data: nuevaCuenta } = await supabase.from('cuentas').insert({
      negocio_id: negocioId, 
      user_id: userId, // 🚀 Usamos la constante segura
      nombre: nombreBase, 
      saldo_inicial: 0, 
      tipo: 'banco'
    }).select('id').single();

    if (nuevaCuenta) mapaCuentas.set(nombreNorm, nuevaCuenta.id);
    return nuevaCuenta?.id;
  }

  const transaccionesLimpias: any[] = [];
  const filasDescartadas: any[] = [];

  for (let index = 0; index < datosExcel.length; index++) {
    const fila = datosExcel[index];
    const row: Record<string, any> = {};
    for (const key in fila) {
      const cleanKey = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      row[cleanKey] = fila[key];
    }

    const parseNumber = (val: any) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      let str = String(val).trim().replace(/[$]/g, '').replace(/\s/g, ''); 
      return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    };

    const montoRaw = parseNumber(row.monto || row.valor || row.monto_unico || 0);
    const tipoTexto = String(row.tipo || '').toLowerCase();
    const esGasto = tipoTexto.includes('gast') || tipoTexto.includes('egre') || montoRaw < 0;

    if (montoRaw === 0) {
      filasDescartadas.push({ fila: index + 2, motivo: 'Monto cero', datos: fila });
      continue;
    }

    let idCuentaFila = cuentaIdForzada; 
    if (!idCuentaFila) {
      const colCuenta = Object.keys(row).find(k => k.includes('cuenta') || k.includes('banco'));
      const nombreCuentaFila = colCuenta && row[colCuenta] ? String(row[colCuenta]).trim() : 'Cuenta Principal';
      idCuentaFila = await obtenerOCrearCuenta(nombreCuentaFila);
    }

    transaccionesLimpias.push({
      negocio_id: negocioId, user_id: userId, cuenta_id: idCuentaFila,
      descripcion: String(row.concepto || row.descripcion || 'Importación').substring(0, 200),
      monto: Math.abs(montoRaw), tipo: esGasto ? 'gasto' : 'ingreso',
      categoria: row.categoria || (esGasto ? 'Operativo' : 'Ventas'),
      created_at: convertirFechaExcel(row.fecha)
    });
  }

  const { error } = await supabase.from('transacciones').insert(transaccionesLimpias);
  revalidatePath('/dashboard');
  return error ? { error: error.message, success: false } : { success: true, procesadas: transaccionesLimpias.length, descartadas: filasDescartadas };
}

/**
 * 3. RECURRENCIA Y TRANSACCIONES
 */
export async function toggleRecurrente(id: string, estadoActual: string) {
  const supabase = await createClient();
  const nuevo = estadoActual === 'activo' ? 'pausado' : 'activo';
  const { error } = await supabase.from('movimientos_recurrentes').update({ estado: nuevo }).eq('id', id);
  return error ? { error: error.message, success: false } : { success: true }; 
}

export async function eliminarRecurrente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('movimientos_recurrentes').delete().eq('id', id);
  return error ? { error: error.message, success: false } : { success: true }; 
}

export async function agregarTransaccion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');
  const { error } = await supabase.from('transacciones').insert({
    negocio_id: formData.get('negocio_id'), user_id: user.id, cuenta_id: formData.get('cuenta_id'),
    tipo: formData.get('tipo'), monto: Number(formData.get('monto')), descripcion: formData.get('descripcion'),
    categoria: formData.get('categoria') || 'Otros', created_at: (formData.get('fecha') as string) || new Date().toISOString()
  });
  revalidatePath('/dashboard');
  return error ? { error: error.message } : { success: true };
}

/**
 * 4. HITOS 🎯
 */
export async function guardarHito(negocioId: string, nombre: string, costo: number, ahorro: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  const { error } = await supabase.from('hitos').insert({ user_id: user.id, negocio_id: negocioId, nombre, costo, ahorro });
  revalidatePath('/dashboard');
  return error ? { error: error.message } : { success: true };
}

export async function borrarHito(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('hitos').delete().eq('id', id).eq('user_id', user?.id);
  revalidatePath('/dashboard');
  return { success: true }; 
}

/**
 * 5. SESIÓN Y API
 */
export async function generarApiKey(negocioId: string) {
  const supabase = await createClient();
  const key = `fluj_live_${Math.random().toString(36).substring(2, 15)}`;
  const { error } = await supabase.from('negocios').update({ api_key: key }).eq('id', negocioId);
  revalidatePath('/dashboard');
  return error ? { error: error.message } : { success: true };
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}