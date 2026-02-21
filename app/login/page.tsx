import { login, signup } from './actions'
import { Activity } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }> 
}) {
  const params = await searchParams; 

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/" className="p-2 bg-blue-50 rounded-full text-blue-600">
            <Activity size={24} />
          </Link>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
          Accede a CajaClaro
        </h2>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Correo electrónico
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {params?.message && ( // <-- Usamos la variable resuelta
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center mt-2">
              {params.message}
            </p>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <button
              formAction={login}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              formAction={signup}
              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}