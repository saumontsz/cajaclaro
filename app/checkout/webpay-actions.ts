// app/checkout/webpay-actions.ts
'use server'

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

const tx = new WebpayPlus.Transaction(
  new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
);

export async function iniciarPagoWebpay(plan: string, ciclo: string, monto: number, negocioId: string) {
  const buyOrder = `ORD-${Math.floor(Math.random() * 1000000)}`; 
  const sessionId = negocioId; // Guardamos el ID del negocio de Flujent
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cajaclaro.vercel.app';
  
  // ¡NUEVO!: Añadimos el ciclo a la URL para que viaje a Transbank y vuelva
  const returnUrl = `${baseUrl}/api/webpay/commit?plan=${plan}&ciclo=${ciclo}`;

  try {
    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);
    return { url: response.url, token: response.token };
  } catch (error) {
    console.error("Error iniciando Webpay:", error);
    throw new Error('No se pudo conectar con Transbank');
  }
}