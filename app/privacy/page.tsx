import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft size={16} /> Volver al registro
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Política de Privacidad</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Tus datos son sagrados para nosotros.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Qué información recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de Identificación:</strong> Tu correo electrónico y nombre (proporcionados por Google al iniciar sesión).</li>
              <li><strong>Datos Financieros:</strong> Los ingresos, gastos, transacciones y presupuestos que ingresas manualmente o subes vía Excel.</li>
              <li><strong>Datos de Uso:</strong> Información técnica sobre cómo usas la app para mejorar el rendimiento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Uso de la Información</h2>
            <p>
              Solo usamos tus datos para:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Proporcionarte el servicio de dashboards y cálculos.</li>
              <li>Autenticar tu identidad.</li>
              <li>Enviarte notificaciones importantes sobre tu cuenta (no spam).</li>
            </ul>
            <p className="mt-2 font-semibold">
              NO vendemos tus datos a terceros ni a anunciantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Almacenamiento y Seguridad</h2>
            <p>
              Tus datos están alojados en <strong>Supabase</strong>, una plataforma segura que cumple con estándares internacionales. Utilizamos encriptación para proteger la transmisión de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Tus Derechos (Ley Chilena 19.628)</h2>
            <p>
              Tienes derecho a solicitar acceso, corrección o eliminación total de tus datos en cualquier momento. Si decides borrar tu cuenta, eliminamos permanentemente toda tu información financiera de nuestros servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5. Contacto</h2>
            <p>
              Si tienes dudas sobre tu privacidad, escríbenos a <strong>flujent@gmail.com</strong>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}