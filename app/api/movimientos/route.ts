// app/api/movimientos/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: Request) {
  try {
    // 1. Extraer la API Key del header 'Authorization'
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Falta la API Key en el header Authorization (Bearer <tu-key>)' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(' ')[1];

    // 2. Buscar el negocio (¡Ahora pedimos también el user_id!)
    const { data: negocio, error: errorNegocio } = await supabase
      .from('negocios')
      .select('id, nombre, plan, user_id') // <-- Añadimos user_id aquí
      .eq('api_key', apiKey)
      .single();

    if (errorNegocio || !negocio) {
      return NextResponse.json(
        { error: 'API Key inválida o negocio no encontrado' },
        { status: 401 }
      );
    }

    // Validación extra: ¿Tiene plan Empresa? 
    const planGuardado = (negocio.plan || '').toLowerCase();
    
    if (planGuardado !== 'empresa' && planGuardado !== 'negocio') {
        return NextResponse.json(
          { error: 'Tu plan actual no soporta acceso vía API. Mejora a Empresa.' },
          { status: 403 }
        );
    }

// 3. Extraer los datos que mandamos en el body
    const body = await request.json();
    const { monto, tipo, descripcion, categoria, fecha } = body;

    if (!monto || !tipo || !descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: monto, tipo y descripcion' },
        { status: 400 }
      );
    }

    // Procesar la fecha para evitar saltos de zona horaria (UTC vs Chile)
    let fechaGuardar = new Date().toISOString(); // Por defecto, la hora exacta actual
    
    if (fecha) {
      const fechaString = String(fecha);
      // Si mandan solo "2026-02-23", le sumamos las 12 del día en zona horaria chilena (-03:00)
      const fechaConHora = fechaString.includes('T') ? fechaString : `${fechaString}T12:00:00-03:00`;
      fechaGuardar = new Date(fechaConHora).toISOString();
    }

    // 4. Guardar el movimiento en la base de datos
    const { error: errorTransaccion } = await supabase
      .from('transacciones')
      .insert({
        negocio_id: negocio.id,
        user_id: negocio.user_id,
        monto: Number(monto),
        tipo: tipo,
        descripcion: descripcion,
        categoria: categoria || 'General',
        created_at: fechaGuardar // Usamos el string final ya procesado
      });

    if (errorTransaccion) {
      throw errorTransaccion;
    }

    // 5. Devolver éxito
    return NextResponse.json(
      { 
        success: true, 
        message: 'Movimiento registrado correctamente',
        negocio: negocio.nombre 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error en Webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    );
  }
}