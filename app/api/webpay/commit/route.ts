// app/api/webpay/commit/route.ts
import { NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Cambiamos POST por GET porque Transbank envió los datos en la URL
export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Extraemos los datos de la URL
  const token = url.searchParams.get('token_ws');
  const tbkToken = url.searchParams.get('TBK_TOKEN'); // Esto llega si el usuario presiona "Anular"
  const planPagado = url.searchParams.get('plan') || 'personal';

  // Si el usuario canceló el pago, Transbank manda TBK_TOKEN en vez de token_ws
  if (!token || tbkToken) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=pago_cancelado`);
  }

  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  try {
    // Confirmamos la transacción (Obligatorio)
    const response = await tx.commit(token);

    if (response.status === 'AUTHORIZED') {
      const negocioId = response.session_id;

      // Actualizamos Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
      );

      await supabase.from('negocios').update({ plan: planPagado }).eq('id', negocioId);

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=exitoso_webpay`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=pago_rechazado`);
    }
  } catch (error) {
    console.error('Error confirmando Webpay:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=error_transbank`);
  }
}