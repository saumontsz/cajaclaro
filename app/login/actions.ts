'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(
  formData: FormData,
  // Opcional: Si usas bind en el form para pasar estos datos, mantenlos. 
  // Si no, puedes borrarlos si solo usas el formData.
  planDestino?: string | null, 
  cicloDestino?: string | null, 
) {
  const supabase = await createClient() 
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Intentamos Iniciar Sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Redirigimos con el error en la URL para mostrarlo en el front
    return redirect(`/login?error=Credenciales incorrectas`)
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // 2. Buscamos si el usuario YA tiene un negocio configurado
    const { data: negocio } = await supabase
      .from('negocios')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    // VÁLVULA DE SEGURIDAD:
    // Si el usuario existe pero NO tiene negocio, lo mandamos a configurarlo.
    if (!negocio) {
      return redirect('/onboarding');
    }

    const planActivo = (negocio.plan || 'gratis').toLowerCase();

    // ESCENARIO A: Si ya es cliente pagado -> Siempre al Dashboard
    // (Asumiendo que 'personal' y 'empresa' son tus planes pagados)
    if (['empresa', 'personal'].includes(planActivo)) {
      return redirect('/dashboard');
    }

    // ESCENARIO B: Si venía con intención de compra desde la Landing
    // Lo mandamos a pagar el plan que quería
    if (planDestino && cicloDestino) {
      return redirect(`/dashboard/planes?plan=${planDestino}&ciclo=${cicloDestino}`);
    }

    // ESCENARIO C: Login normal (Plan gratis) -> Al Dashboard
    return redirect('/dashboard');
  }
}

export async function signup(
  formData: FormData
) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') // Obtenemos tu dominio actual (localhost o vercel)
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Creamos el usuario con redirección configurada
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Importante: Esto asegura que al hacer clic en el correo, vuelvan a tu web
      emailRedirectTo: `${origin}/auth/callback`, 
    },
  })

  if (error) {
    // Retornamos el objeto error para que el componente (useFormState o similar) lo maneje
    return { error: error.message }
  }

  // 2. ÉXITO: No redirigimos.
  // Devolvemos success: true para que el Frontend muestre el aviso verde "Revisa tu correo"
  return { success: true }
}