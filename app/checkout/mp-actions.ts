// app/checkout/mp-actions.ts
'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { redirect } from 'next/navigation';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

/**
 * Crea la preferencia de pago en Mercado Pago.
 * @param plan - 'personal' o 'empresa'
 * @param ciclo - 'mensual' o 'anual'
 * @param monto - El valor a cobrar
 * @param negocioId - El ID del negocio en Supabase para identificar al pagador
 */
export async function crearPagoMP(plan: string, ciclo: string, monto: number, negocioId: string) {
  const preference = new Preference(client);
  
  let urlARedirigir = '';

  try {
    const response = await preference.create({
      body: {
        // Enlazamos el pago con el ID del negocio en tu DB
        external_reference: negocioId, 
        items: [
          {
            id: `${plan}-${ciclo}`,
            title: `Flujent: Plan ${plan.toUpperCase()} (${ciclo})`,
            quantity: 1,
            unit_price: Number(monto),
            currency_id: 'CLP',
          }
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=exitoso`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planes?error=pago_fallido`,
        },
        auto_return: 'approved',
        // URL donde Mercado Pago avisará que el pago se completó
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      }
    });

    if (response.init_point) {
      urlARedirigir = response.init_point;
    }
  } catch (error: any) {
    console.error('Error real de MP:', error);
    throw new Error('No se pudo generar el cobro.');
  }

  // Redirigimos fuera del catch para evitar el error NEXT_REDIRECT de Next.js
  if (urlARedirigir) {
    redirect(urlARedirigir);
  }
}