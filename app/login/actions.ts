'use server'

import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(
  planDestino: string | undefined | null, 
  cicloDestino: string | undefined | null, 
  formData: FormData
) {
  const supabase = await createClient() 
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=Credenciales incorrectas`)
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // 1. Buscamos el negocio del usuario
    const { data: negocio } = await supabase
      .from('negocios')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const planActivo = (negocio?.plan || '').toLowerCase();

    // ESCENARIO A: Si ya es cliente pagado -> Siempre al Dashboard
    if (planActivo === 'empresa' || planActivo === 'personal' || planActivo === 'pyme') {
      return redirect('/dashboard');
    }

    // ESCENARIO B: Si eligió un plan en la Landing Page
    // Lo mandamos a la tabla de comparación (pasando los params para que la tabla sepa qué resaltar)
    if (planDestino && cicloDestino) {
      return redirect(`/dashboard/planes?plan=${planDestino}&ciclo=${cicloDestino}`);
    }

    // ESCENARIO C: Login normal (sin intención previa de compra)
    return redirect('/dashboard');
  }
}

export async function signup(
  planDestino: string | undefined | null, 
  cicloDestino: string | undefined | null, 
  formData: FormData
) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // En el registro aplicamos la misma lógica:
  // Si trae un plan desde la Landing, a la tabla de precios. Si no, al Dashboard.
  if (planDestino && cicloDestino) {
    return redirect(`/dashboard/planes?plan=${planDestino}&ciclo=${cicloDestino}`)
  } else {
    return redirect('/dashboard') 
  }
}