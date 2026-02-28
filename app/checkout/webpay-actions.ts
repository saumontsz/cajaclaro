'use server'

import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from 'transbank-sdk';
import { createClient as createAdminClient } from '@supabase/supabase-js'; 
import { createClient } from '@/utils/supabase/server';

export async function iniciarPagoWebpay(plan: string, ciclo: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesión expirada" };

    const precios: any = {
      personal: { mensual: 4990, anual: 49900 },
      empresa: { mensual: 14990, anual: 149900 }
    };

    const monto = precios[plan.toLowerCase()]?.[ciclo.toLowerCase()] || 4990;
    const buyOrder = `FLJ-${Date.now()}`;
    const sessionId = user.id.slice(0, 20);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/webpay/confirmar`;

    const tx = new WebpayPlus.Transaction(
      new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
    );

    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);

    // 🚀 BYPASS DE RLS: Usamos la Service Role Key para OBLIGAR a la DB a guardar el registro
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Asegúrate de que esta variable exista
    );

    console.log("📝 [SERVER ACTION] Forzando inserción en DB como Admin...");
    
    const { error: dbError } = await supabaseAdmin.from('pagos_pendientes').insert({
      user_id: user.id,
      buy_order: buyOrder,
      monto,
      plan: plan.toLowerCase(),
      ciclo: ciclo.toLowerCase(),
      token: response.token,
      estado: 'pendiente'
    });

    if (dbError) {
      console.error("❌ [SERVER ACTION] ERROR CRÍTICO AL GUARDAR EN DB:", dbError);
      // 🔥 DETENEMOS EL FLUJO: Si no se guarda, no mandamos al usuario a pagar
      return { success: false, error: `Error DB: ${dbError.message}` };
    }

    console.log("✅ [SERVER ACTION] DB guardada con éxito. Redirigiendo a Webpay...");
    return { success: true, url: response.url, token: response.token };

  } catch (error: any) {
    console.error("❌ ERROR SDK WEBPAY:", error);
    return { success: false, error: "Falló la conexión con Transbank" };
  }
}