import { NextRequest, NextResponse } from 'next/server';
import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from 'transbank-sdk';
import { createClient as createAdminClient } from '@supabase/supabase-js';

async function procesarConfirmacion(token: string, request: NextRequest) {
  // 🚨 ALARMA DE DEPURACIÓN
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("🚨 ERROR FATAL: No se encontró SUPABASE_SERVICE_ROLE_KEY en .env.local");
    return NextResponse.redirect(new URL('/dashboard?error=llave_maestra_faltante', request.url));
  }

  // Si la llave está, creamos el cliente Admin
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
  
  const tx = new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );

  try {
    const response = await tx.commit(token);
    
    if (response.response_code === 0) {
      console.log("✅ [WEBPAY] Pago exitoso. Buscando token en DB...");

      const { data: pagoPendiente, error: errorPago } = await supabaseAdmin
        .from('pagos_pendientes')
        .select('*')
        .eq('token', token)
        .single();

      if (errorPago || !pagoPendiente) {
        // 🔥 Si esto sigue saliendo, el token no se guardó en el inicio
        console.error("❌ [DB ADMIN] Pago no encontrado:", errorPago);
        return NextResponse.redirect(new URL('/dashboard?error=pago_no_registrado', request.url));
      }

      console.log("📝 [DB ADMIN] Actualizando plan a:", pagoPendiente.plan);

      // Actualizamos el negocio (Plan de $4.990 o $14.990)
      const { error: errorUpdate } = await supabaseAdmin
        .from('negocios')
        .update({ 
          plan: pagoPendiente.plan.toLowerCase(), 
          plan_ciclo: pagoPendiente.ciclo.toLowerCase() 
        })
        .eq('user_id', pagoPendiente.user_id);

      if (errorUpdate) {
        console.error("❌ [DB ADMIN] Error al actualizar negocio:", errorUpdate);
        return NextResponse.redirect(new URL('/dashboard?error=error_actualizacion_db', request.url));
      }

      await supabaseAdmin
        .from('pagos_pendientes')
        .update({ estado: 'completado' })
        .eq('id', pagoPendiente.id);

      return NextResponse.redirect(new URL('/dashboard?pago=exito', request.url));
    }
    
    return NextResponse.redirect(new URL('/dashboard?error=pago_rechazado', request.url));
  } catch (error: any) {
    console.error("🔥 [WEBPAY] Error técnico:", error.message);
    return NextResponse.redirect(new URL('/dashboard?error=error_tecnico', request.url));
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return await procesarConfirmacion(formData.get('token_ws') as string, request);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token_ws');
  if (token) return await procesarConfirmacion(token, request);
  return NextResponse.redirect(new URL('/dashboard?error=pago_cancelado', request.url));
}