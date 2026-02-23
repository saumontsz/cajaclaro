// app/checkout/webpay-actions.ts
'use server'

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

// Configuramos Transbank en modo Integración (Pruebas)
const tx = new WebpayPlus.Transaction(
  new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
);

export async function iniciarPagoWebpay(plan: string, ciclo: string, monto: number, negocioId: string) {
  const buyOrder = `ORD-${Math.floor(Math.random() * 1000000)}`; // Orden aleatoria única
  const sessionId = negocioId; // Guardamos el ID del negocio
  
  // EL BLINDAJE VA AQUÍ ADENTRO: Donde 'plan' sí existe y tiene el valor que eligió el usuario
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cajaclaro.vercel.app';
  const returnUrl = `${baseUrl}/api/webpay/commit?plan=${plan}`;

  try {
    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);
    // Transbank nos da una URL y un Token para redirigir al usuario
    return { url: response.url, token: response.token };
  } catch (error) {
    console.error("Error iniciando Webpay:", error);
    throw new Error('No se pudo conectar con Transbank');
  }
}