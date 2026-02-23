// app/checkout/webpay-actions.ts
'use server'
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cajaclaro.vercel.app';
const returnUrl = `${baseUrl}/api/webpay/commit?plan=${plan}`;

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

// Configuramos Transbank en modo Integración (Pruebas)
const tx = new WebpayPlus.Transaction(
  new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
);

export async function iniciarPagoWebpay(plan: string, ciclo: string, monto: number, negocioId: string) {
  const buyOrder = `ORD-${Math.floor(Math.random() * 1000000)}`; // Orden aleatoria única
  const sessionId = negocioId; // Guardamos el ID del negocio aquí para identificarlo después
  
  // A dónde nos devolverá Transbank después de pagar
  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webpay/commit?plan=${plan}`;

  try {
    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);
    // Transbank nos da una URL y un Token para redirigir al usuario
    return { url: response.url, token: response.token };
  } catch (error) {
    console.error("Error iniciando Webpay:", error);
    throw new Error('No se pudo conectar con Transbank');
  }
}