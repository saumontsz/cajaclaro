'use client'

import { useSearchParams } from 'next/navigation'
import { Check, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
// 👇 Importamos el componente que tiene la lógica de Transbank
import BotonWebpay from './BotonWebpay'

function CheckoutContent() {
  const searchParams = useSearchParams()

  const plan = searchParams.get('plan') || 'personal'
  const ciclo = searchParams.get('ciclo') || 'mensual'

  // Configuración de precios de Flujent
  const precios: any = {
    personal: { nombre: 'Personal', mensual: 4990, anual: 49900 },
    empresa: { nombre: 'Empresa', mensual: 14990, anual: 149900 }
  }

  // Validación de seguridad por si el plan en la URL no existe
  const infoPlan = precios[plan.toLowerCase()] || precios.personal
  const monto = infoPlan[ciclo.toLowerCase()] || infoPlan.mensual

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard/planes" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> Volver a planes
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* LADO IZQUIERDO: Resumen */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Resumen de suscripción</h1>
              <p className="text-slate-500 font-medium">Estás a un paso de potenciar tu flujo de caja en Flujent.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Plan seleccionado</span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                  {plan}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Flujent {infoPlan.nombre}</h2>
                <span className="text-xl font-black dark:text-white tabular-nums">${monto.toLocaleString('es-CL')}</span>
              </div>
              
              <ul className="space-y-3 border-t border-gray-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Check size={16} className="text-green-500" strokeWidth={3} /> Acceso inmediato a funciones pro
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Check size={16} className="text-green-500" strokeWidth={3} /> Soporte prioritario
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Check size={16} className="text-green-500" strokeWidth={3} /> Sin contratos forzosos
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl">
              <ShieldCheck size={20} className="text-green-500 shrink-0" />
              <span>
                Pago procesado de forma segura por Transbank en Chile. Flujent nunca almacena los datos de tu tarjeta.
              </span>
            </div>
          </div>

          {/* LADO DERECHO: Detalle de Pago */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 dark:text-white">Total a pagar</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Suscripción Flujent</span>
                <span className="dark:text-white tabular-nums">${monto.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Impuestos (IVA)</span>
                <span className="dark:text-white">$0</span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-100 dark:border-slate-800 pt-4 mt-4 font-black">
                <span className="dark:text-white uppercase text-xs self-center tracking-widest">Total Final</span>
                <span className="text-2xl text-blue-600 dark:text-blue-500 tabular-nums">${monto.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {/* 👇 USAMOS EL COMPONENTE REAL CON LAS PROPS DINÁMICAS */}
            <BotonWebpay plan={plan} ciclo={ciclo} />
            
            <p className="text-[10px] text-slate-400 text-center mt-6 uppercase font-bold tracking-widest">
              Acepta tarjetas de crédito y débito
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

// Next.js requiere Suspense para usar useSearchParams en Client Components
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Cargando resumen...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}