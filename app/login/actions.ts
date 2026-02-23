// app/login/actions.ts
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

  // 1. Buscamos si el usuario ya tiene un negocio con un plan activo
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: negocio } = await supabase
      .from('negocios')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const planActivo = (negocio?.plan || '').toLowerCase();

    // ESCENARIO A: Ya es un cliente pagado -> Al Dashboard
    if (planActivo === 'empresa' || planActivo === 'personal') {
      redirect('/dashboard');
    }

    // ESCENARIO B: No ha pagado, pero cliqueó un plan en la Landing Page
    if (planDestino && cicloDestino) {
      redirect(`/checkout?plan=${planDestino}&ciclo=${cicloDestino}`);
    }

    // ESCENARIO C: No ha pagado y le dio a "Comenzar Gratis" (sin elegir plan)
    redirect('/login/planes'); // <--- AQUÍ LO MANDAMOS A TU CARPETA DE PLANES
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

  // En el registro (signup), el flujo es idéntico:
  if (planDestino && cicloDestino) {
    redirect(`/checkout?plan=${planDestino}&ciclo=${cicloDestino}`)
  } else {
    redirect('/login/planes') // Lo mandamos a comparar planes
  }
}