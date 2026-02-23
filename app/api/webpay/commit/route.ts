import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { createClient } from '@supabase/supabase-js';

// Esto obliga a Next.js a no cachear esta ruta (vital para pasarelas de pago)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // 1. Extraemos los parámetros que Transbank envía en la URL
  const token = url.searchParams.get('token_ws');
  const tbkToken = url.searchParams.get('TBK_TOKEN'); 
  const planPagado = url.searchParams.get('plan') || 'personal';

  // URL base de rescate por si la variable de entorno falla
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cajaclaro.vercel.app';

  // 2. Control de Cancelación
  // Si existe TBK_TOKEN o no hay token_ws, significa que el usuario apretó "Anular compra"
  if (!token || tbkToken) {
    return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=pago_cancelado`);
  }

  // 3. Inicializamos Transbank en modo Integración
  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  try {
    // 4. Confirmamos la transacción con Transbank (Paso obligatorio)
    const response = await tx.commit(token);

    if (response.status === 'AUTHORIZED') {
      const negocioId = response.session_id; // Aquí recuperamos el ID que enviamos al inicio

      // 5. Conexión a Supabase usando la LLAVE MAESTRA (Service Role Key)
      // Esto es crucial para saltarse las reglas RLS y poder actualizar la tabla
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
      );

      // 6. Actualizamos el plan del negocio en la base de datos
      const { data, error } = await supabase
        .from('negocios')
        .update({ plan: planPagado })
        .eq('id', negocioId)
        .select(); // Pedimos que nos devuelva el dato modificado para confirmar

      // 7. Sistema de Logs para depurar en Vercel
      if (error) {
        console.error('⚠️ ERROR CRÍTICO DE SUPABASE:', error);
        // Aunque falló la BD, el pago se cobró, así que debemos revisar los logs
        return NextResponse.redirect(`${baseUrl}/dashboard?error=bd_no_actualizada`);
      } else {
        console.log('✅ PLAN ACTUALIZADO CON ÉXITO EN FLUJENT:', data);
        return NextResponse.redirect(`${baseUrl}/dashboard?pago=exitoso_webpay`);
      }

    } else {
      // Si Transbank rechaza la tarjeta (ej. sin fondos)
      console.error('❌ PAGO RECHAZADO POR TRANSBANK. Estado:', response.status);
      return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=pago_rechazado`);
    }

  } catch (error) {
    // Si la conexión con los servidores de Transbank falla
    console.error('🚨 ERROR GENERAL CONFIRMANDO WEBPAY:', error);
    return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=error_transbank`);
  }
}