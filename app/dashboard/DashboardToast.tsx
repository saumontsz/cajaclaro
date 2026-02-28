'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function DashboardToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: 'exito' })

  useEffect(() => {
    const pago = searchParams.get('pago')
    const error = searchParams.get('error')

    if (pago === 'exito') {
      setMensaje({ texto: '¡Pago procesado con éxito! Tu plan ha sido actualizado.', tipo: 'exito' })
      setVisible(true)
    } else if (error) {
      const errorTexto = error === 'pago_cancelado' 
        ? 'El pago fue cancelado o no se completó.' 
        : 'Hubo un problema al procesar tu pago. Inténtalo de nuevo.'
      setMensaje({ texto: errorTexto, tipo: 'error' })
      setVisible(true)
    }

    // Limpiar la URL después de 5 segundos para que no reaparezca el toast al recargar
    if (pago || error) {
      const timer = setTimeout(() => {
        setVisible(false)
        router.replace('/dashboard')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-right-4">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-2xl ${
        mensaje.tipo === 'exito' 
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
      }`}>
        {mensaje.tipo === 'exito' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <p className="text-sm font-bold">{mensaje.texto}</p>
        <button onClick={() => setVisible(false)} className="ml-2 hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}