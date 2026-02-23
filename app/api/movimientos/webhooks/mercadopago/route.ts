// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('data.id') || url.searchParams.get('id');
  const type = url.searchParams.get('type');

  // Solo nos interesan los pagos
  if (type === 'payment' && id) {
    try {
      // 1. Consultar el estado del pago en la API de Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await response.json();

      // 2. Si el pago está aprobado, actualizamos Supabase
      if (payment.status === 'approved') {
        const negocioId = payment.external_reference;
        const planPagado = payment.additional_info.items[0].id.split('-')[0]; // 'empresa' o 'personal'

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // Usamos la Service Role para saltar el RLS
        );

        const { error } = await supabase
          .from('negocios')
          .update({ plan: planPagado })
          .eq('id', negocioId);

        if (error) throw error;
        console.log(`✅ Plan ${planPagado} activado para el negocio: ${negocioId}`);
      }
    } catch (err) {
      console.error('Error procesando Webhook MP:', err);
    }
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 });
}