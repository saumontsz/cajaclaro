import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Obtener la API Key de los headers de la petición
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key no proporcionada' }, { status: 401 })
    }

    // 2. Inicializar Supabase con privilegios de servidor (Service Role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Buscar a qué negocio pertenece esta API Key y revisar su plan
    const { data: negocio, error: errorNegocio } = await supabase
      .from('negocios')
      .select('id, user_id, plan')
      .eq('api_key', apiKey)
      .single()

    if (errorNegocio || !negocio) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 })
    }

    // 4. EL MURO DE PAGO: Verificar si es Premium
    if (negocio.plan !== 'premium') {
      return NextResponse.json(
        { error: 'Función bloqueada. Debes actualizar al plan Premium para usar la API y automatizar ingresos.' }, 
        { status: 403 }
      )
    }

    // 5. Leer los datos enviados
    const body = await request.json()
    const { tipo, monto, descripcion } = body

    if (!tipo || !monto || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos (tipo, monto o descripcion)' }, { status: 400 })
    }

    // 6. Guardar la transacción
    const { error: errorInsert } = await supabase.from('transacciones').insert({
      negocio_id: negocio.id,
      user_id: negocio.user_id,
      tipo,
      monto: Number(monto),
      descripcion
    })

    if (errorInsert) throw errorInsert

    return NextResponse.json({ success: true, message: 'Transacción guardada exitosamente' }, { status: 201 })

  } catch (error) {
    console.error('Error en API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}