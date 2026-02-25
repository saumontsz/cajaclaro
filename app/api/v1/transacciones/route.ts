import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la cabecera x-api-key' }, { status: 401 })
    }

    // --- CAMBIO IMPORTANTE AQUÍ ---
    // Usamos createClient directo con la SERVICE_ROLE_KEY para saltarnos las reglas RLS
    // Esto nos permite buscar en la tabla 'negocios' aunque no haya usuario logueado.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscamos el negocio con el cliente ADMIN
    const { data: negocio, error: errorBusqueda } = await supabaseAdmin
      .from('negocios')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single()

    if (errorBusqueda || !negocio) {
      console.error("Error buscando negocio:", errorBusqueda)
      return NextResponse.json({ error: 'API Key inválida o negocio no encontrado' }, { status: 403 })
    }

    const { monto, descripcion, tipo } = body

    if (!monto || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos obligatorios: monto y descripcion' }, { status: 400 })
    }

    // Guardamos la transacción usando también el cliente Admin
    const { error: errorInsercion } = await supabaseAdmin
      .from('transacciones')
      .insert({
        negocio_id: negocio.id,
        user_id: negocio.user_id,
        monto: Number(monto),
        descripcion: descripcion,
        tipo: tipo === 'gasto' ? 'gasto' : 'ingreso',
        categoria: 'API Externa',
        created_at: new Date().toISOString()
      })

    if (errorInsercion) {
      return NextResponse.json({ error: 'Error al guardar: ' + errorInsercion.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Transacción creada exitosamente',
      data: { monto, descripcion, tipo: tipo || 'ingreso' }
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 400 })
  }
}