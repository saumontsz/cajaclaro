import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. OBTENER DATOS Y API KEY
    const body = await request.json()
    const apiKey = request.headers.get('x-api-key') // La clave que envías desde el header

    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la cabecera x-api-key' }, { status: 401 })
    }

    // 2. VALIDAR LA LLAVE EN SUPABASE
    const supabase = await createClient()

    // Buscamos el negocio dueño de esta API Key
    const { data: negocio, error: errorBusqueda } = await supabase
      .from('negocios')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single()

    if (errorBusqueda || !negocio) {
      return NextResponse.json({ error: 'API Key inválida o negocio no encontrado' }, { status: 403 })
    }

    // 3. VALIDAR DATOS MÍNIMOS
    const { monto, descripcion, tipo } = body

    if (!monto || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos obligatorios: monto y descripcion' }, { status: 400 })
    }

    // 4. GUARDAR LA TRANSACCIÓN
    const { error: errorInsercion } = await supabase
      .from('transacciones')
      .insert({
        negocio_id: negocio.id,
        user_id: negocio.user_id, // Usamos el ID del dueño de la API Key
        monto: Number(monto),
        descripcion: descripcion,
        tipo: tipo === 'gasto' ? 'gasto' : 'ingreso', // Por defecto ingreso si no especifican
        categoria: 'API Externa', // Categoría automática para identificar estos movimientos
        created_at: new Date().toISOString()
      })

    if (errorInsercion) {
      return NextResponse.json({ error: 'Error al guardar en base de datos: ' + errorInsercion.message }, { status: 500 })
    }

    // 5. ÉXITO
    return NextResponse.json({ 
      success: true, 
      message: 'Transacción creada exitosamente',
      data: { monto, descripcion, tipo: tipo || 'ingreso' }
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: 'Error procesando la solicitud (JSON inválido)' }, { status: 400 })
  }
}