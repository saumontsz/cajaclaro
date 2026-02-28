'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ScrollText } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          {/* 🚀 BOTÓN INTELIGENTE: Regresa a la página anterior real */}
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Volver a la página anterior
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ScrollText className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Términos y Condiciones</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Aceptación de los Términos</h2>
            <p>
              Bienvenido a <strong>Flujent</strong>. Al registrarte y utilizar nuestra plataforma, aceptas cumplir con estos términos. Si no estás de acuerdo con alguna parte, no deberías usar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Descripción del Servicio</h2>
            <p>
              Flujent es una herramienta de gestión financiera diseñada para ayudar a organizar ingresos, gastos y proyecciones.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 mt-3">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                ⚠️ Importante: Flujent no es un asesor financiero. La información proporcionada por la aplicación es solo para fines informativos y de organización. No nos hacemos responsables de las decisiones de inversión o financieras que tomes basándote en nuestros datos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Cuentas y Seguridad</h2>
            <p>
              Eres responsable de mantener la seguridad de tu cuenta (especialmente si usas Google Login, protege tu cuenta de Google). Flujent no se hace responsable de pérdidas causadas por accesos no autorizados resultantes de tu negligencia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Planes y Pagos</h2>
            <p>
              Ofrecemos planes gratuitos y de pago. Nos reservamos el derecho de modificar los precios con un aviso previo razonable. Las suscripciones se cobran por adelantado y no son reembolsables, salvo lo exigido por la ley chilena (SERNAC).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5. Propiedad Intelectual</h2>
            <p>
              El código, diseño y marca "Flujent" son propiedad exclusiva de los desarrolladores. Tus datos financieros te pertenecen a ti; nosotros solo los procesamos para mostrarte tus gráficos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será resuelta en los tribunales de Santiago de Chile.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}