// app/checkout/mp-actions.ts
'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { redirect } from 'next/navigation';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function crearPagoMP(plan: string, ciclo: string, monto: number) {
  const preference = new Preference(client);
  
  // 1. Creamos una variable para guardar la URL
  let urlARedirigir = '';

  try {
    const response = await preference.create({
      body: {
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
      }
    });

    if (response.init_point) {
      // 2. En lugar de redirigir aquí, guardamos la URL
      urlARedirigir = response.init_point;
    }
  } catch (error: any) {
    console.error('Error real de MP:', error);
    throw new Error('No se pudo generar el cobro.');
  }

  // 3. Redirigimos FUERA del bloque try/catch
  if (urlARedirigir) {
    redirect(urlARedirigir);
  }
}