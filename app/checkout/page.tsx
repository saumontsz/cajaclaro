import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, CheckCircle2, Zap, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { crearPagoMP } from './mp-actions'

// Configuración de precios de Flujent
const PRECIOS = {
  personal: {
    nombre: 'Plan Personal Pro',
    mensual: 5990,
    anual: 59900,
    beneficios: [
      'Control de ingresos y gastos',
      'Simulador de riesgo financiero',
      'Gráficos analíticos avanzados',
      'Exportación de datos a Excel'
    ]
  },
  empresa: {
    nombre: 'Plan Empresa Pro',
    mensual: 19990,
    anual: 199900,
    beneficios: [
      'Todo lo del Plan Personal',
      'Llave API Secreta y Webhooks',
      'Automatización con Zapier y Shopify',
      'Importación masiva desde Excel',
      'Soporte prioritario'
    ]
  }
}

interface CheckoutProps {
  searchParams: Promise<{ plan?: string; ciclo?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutProps) {
  // 1. Verificación de sesión
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Procesamiento de parámetros de la URL
  const params = await searchParams;
  const planDestino = params?.plan as 'personal' | 'empresa';
  const cicloDestino = params?.ciclo as 'mensual' | 'anual';

  // Si no hay parámetros válidos, devolvemos a la comparación de planes
  if (!planDestino || !PRECIOS[planDestino] || !cicloDestino) {
    redirect('/dashboard/planes')
  }

  const detallesPlan = PRECIOS[planDestino]
  const precioFinal = detallesPlan[cicloDestino]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      
      <div className="w-full max-w-4xl">
        {/* BOTÓN DE RETORNO A PLANES */}
        <Link 
          href="/dashboard/planes" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Cambiar de plan
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Finaliza tu suscripción
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Estás a segundos de activar las herramientas avanzadas de Flujent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: RESUMEN DEL PEDIDO */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Resumen de cuenta</h2>
            
            <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {detallesPlan.nombre}
                  {planDestino === 'empresa' && <Zap size={20} className="text-purple-500 fill-purple-500" />}
                </h3>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-wide">
                  Facturación {cicloDestino}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  ${precioFinal.toLocaleString('es-CL')}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">CLP / TOTAL</p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest mb-6">Beneficios incluidos:</p>
              <ul className="space-y-4">
                {detallesPlan.beneficios.map((ben, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {ben}
                  </li>
                ))}
              </ul>
            </div>
            
            {cicloDestino === 'anual' && (
              <div className="mt-8 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-4">
                <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded">PROMO</div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  Ahorro aplicado: 2 meses gratis incluidos en el precio anual.
                </p>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: MÉTODO DE PAGO (MERCADO PAGO) */}
          <div className="sticky top-24">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl shadow-blue-900/20">
              
              <div className="flex items-center gap-4 mb-10 text-slate-300 bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                <ShieldCheck size={28} className="text-blue-400 shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium">
                  Tu pago será procesado de forma segura a través de Mercado Pago. Compatible con Webpay, tarjetas de débito y crédito.
                </p>
              </div>

              {/* FORMULARIO DE ACCIÓN DE MERCADO PAGO */}
              <form action={async () => {
                'use server'
                await crearPagoMP(planDestino, cicloDestino, precioFinal);
              }}>
                <button 
                  type="submit"
                  className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-lg font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex justify-center items-center gap-3 group active:scale-[0.98]"
                >
                  Pagar con Mercado Pago 
                  <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </form>
              
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
                   <span className="text-[10px] font-bold text-white tracking-widest uppercase italic">Webpay</span>
                   <span className="text-[10px] font-bold text-white tracking-widest uppercase">Visa</span>
                   <span className="text-[10px] font-bold text-white tracking-widest uppercase">Mastercard</span>
                </div>
                <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-[0.1em]">
                  Transacción encriptada de punto a punto.
                </p>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-center text-slate-400 px-8 leading-relaxed font-medium">
              Al confirmar la suscripción, autorizas a Flujent a procesar este pago único para activar tu cuenta.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}