import { Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Activity size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          CajaClaro
        </h1>
        <p className="text-gray-500 mb-6">
          Proyecciones financieras simples para microemprendedores.
        </p>
        <Link 
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors w-full"
        >
          Empezar a proyectar
        </Link>
      </div>
    </main>
  );
}