// app/api/movimientos/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Forzamos que la ruta sea dinámica (evita errores en el build)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 2. Definimos las llaves DENTRO de la función handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('Faltan variables de entorno de Supabase');
    }

    // 3. Instanciamos el cliente aquí adentro
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // --- RESTO DE TU LÓGICA IGUAL ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Falta la API Key en el header Authorization' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(' ')[1];

    const { data: negocio, error: errorNegocio } = await supabase
      .from('negocios')
      .select('id, nombre, plan, user_id')
      .eq('api_key', apiKey)
      .single();

    if (errorNegocio || !negocio) {
      return NextResponse.json(
        { error: 'API Key inválida o negocio no encontrado' },
        { status: 401 }
      );
    }

    // ... (El resto de tu código de validación y guardado se mantiene igual)

    const body = await request.json();
    const { monto, tipo, descripcion, categoria, fecha } = body;

    // (Lógica de fecha y guardado...)
    
    // 4. Guardar el movimiento
    const { error: errorTransaccion } = await supabase
      .from('transacciones')
      .insert({
        negocio_id: negocio.id,
        user_id: negocio.user_id,
        monto: Number(monto),
        tipo: tipo,
        descripcion: descripcion,
        categoria: categoria || 'General',
        created_at: new Date().toISOString() 
      });

    if (errorTransaccion) throw errorTransaccion;

    return NextResponse.json(
      { success: true, message: 'Movimiento registrado correctamente' },
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