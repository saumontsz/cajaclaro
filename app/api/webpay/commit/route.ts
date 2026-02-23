// app/api/webpay/commit/route.ts
import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Transbank nos envía el token_ws de vuelta por POST
  const formData = await request.formData();
  const token = formData.get('token_ws');
  
  // Obtenemos el plan de la URL (lo pasamos en el paso 2)
  const urlParams = new URL(request.url);
  const planPagado = urlParams.searchParams.get('plan') || 'personal';

  // Si el usuario cancela en la pantalla de Webpay, vuelve sin token
  if (!token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=pago_cancelado`);
  }

  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  try {
    // Confirmamos la transacción con Transbank (Obligatorio, o el dinero se devuelve)
    const response = await tx.commit(token as string);

    if (response.status === 'AUTHORIZED') {
      const negocioId = response.session_id; // ¡Aquí recuperamos el ID del negocio!

      // Actualizamos Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
      );

      await supabase.from('negocios').update({ plan: planPagado }).eq('id', negocioId);

      // Redirigimos al Dashboard con éxito
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=exitoso_webpay`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=pago_rechazado`);
    }
  } catch (error) {
    console.error('Error confirmando Webpay:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=error_transbank`);
  }
}