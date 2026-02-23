// app/api/webpay/commit/route.ts
import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // 1. Extraemos token, plan y el NUEVO ciclo
  const token = url.searchParams.get('token_ws');
  const tbkToken = url.searchParams.get('TBK_TOKEN'); 
  const planPagado = url.searchParams.get('plan') || 'personal';
  const cicloPagado = url.searchParams.get('ciclo') || 'mensual';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cajaclaro.vercel.app';

  // 2. Control de Cancelación manual del usuario
  if (!token || tbkToken) {
    return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=pago_cancelado`);
  }

  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  try {
    // 3. Confirmamos transacción con Transbank
    const response = await tx.commit(token);

    if (response.status === 'AUTHORIZED') {
      const negocioId = response.session_id;

      // 4. LÓGICA DE TIEMPO (Calculadora de Expiración)
      const fechaExpiracion = new Date();
      if (cicloPagado === 'anual') {
        fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1); // +1 Año
      } else {
        fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1); // +1 Mes
      }

      // 5. Conexión a Supabase con Llave Maestra
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
      );

      // 6. Actualizamos BD con plan y la nueva fecha límite
      const { data, error } = await supabase
        .from('negocios')
        .update({ 
          plan: planPagado,
          fecha_expiracion: fechaExpiracion.toISOString() // Formato seguro para BD
        })
        .eq('id', negocioId)
        .select();

      if (error) {
        console.error('⚠️ ERROR CRÍTICO DE SUPABASE:', error);
        return NextResponse.redirect(`${baseUrl}/dashboard?error=bd_no_actualizada`);
      } else {
        console.log('✅ SUSCRIPCIÓN ACTIVADA HASTA:', fechaExpiracion.toISOString());
        return NextResponse.redirect(`${baseUrl}/dashboard?pago=exitoso_webpay`);
      }

    } else {
      return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=pago_rechazado`);
    }

  } catch (error) {
    console.error('🚨 ERROR GENERAL CONFIRMANDO WEBPAY:', error);
    return NextResponse.redirect(`${baseUrl}/dashboard/planes?error=error_transbank`);
  }
}