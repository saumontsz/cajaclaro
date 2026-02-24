'use client'

import { useRef, useState } from 'react'
import { agregarTransaccion } from './actions'
import { PlusCircle, Loader2, DollarSign, FileText } from 'lucide-react'

export default function NuevoMovimientoForm({ negocioId }: { negocioId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [tipo, setTipo] = useState('ingreso')
  
  // ESTADOS PARA EL FORMATEO
  const [montoVisual, setMontoVisual] = useState('') // Lo que ve el usuario (ej: 1.500)
  const [montoReal, setMontoReal] = useState('')     // Lo que se envía (ej: 1500)

  // Función formateadora mientras escribe
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Quitamos cualquier cosa que no sea número (puntos, comas, letras)
    const valorLimpio = e.target.value.replace(/\D/g, '')

    // 2. Si está vacío, limpiamos todo
    if (valorLimpio === '') {
      setMontoVisual('')
      setMontoReal('')
      return
    }

    // 3. Guardamos el valor real para el input hidden
    setMontoReal(valorLimpio)

    // 4. Formateamos visualmente con puntos (Estándar Chileno)
    const valorFormateado = new Intl.NumberFormat('es-CL').format(Number(valorLimpio))
    setMontoVisual(valorFormateado)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    await agregarTransaccion(formData)
    setIsPending(false)
    
    // Reseteamos formulario y estados manuales
    formRef.current?.reset()
    setTipo('ingreso')
    setMontoVisual('')
    setMontoReal('')
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="text-blue-600 dark:text-blue-500" size={20} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nuevo Movimiento</h3>
      </div>

      <form 
        ref={formRef}
        action={handleSubmit} 
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="negocio_id" value={negocioId} />

        {/* 1. SELECTOR DE TIPO */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 ml-1">Tipo de movimiento</label>
          <select 
            name="tipo" 
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
          >
            <option value="ingreso">Ingreso (+)</option>
            <option value="gasto">Gasto (-)</option>
          </select>
        </div>

        {/* 2. MONTO (Con formateador automático) */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 ml-1">Monto</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            
            {/* INPUT VISIBLE (Solo visualización) */}
            <input 
              type="text" 
              inputMode="numeric" // Esto fuerza el teclado numérico en celulares
              placeholder="0" 
              value={montoVisual}
              onChange={handleMontoChange}
              required
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />

            {/* INPUT OCULTO (El que realmente se envía al servidor) */}
            <input 
              type="hidden" 
              name="monto" 
              value={montoReal} 
            />
          </div>
        </div>

        {/* 3. DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1 ml-1">Concepto</label>
          <div className="relative">
            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input 
              name="descripcion" 
              type="text" 
              placeholder="Ej: Pago cliente, Luz, Internet..." 
              required
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* BOTÓN DE GUARDAR */}
        <button 
          type="submit" 
          disabled={isPending}
          className={`mt-2 w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            tipo === 'ingreso' 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20' 
              : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 dark:shadow-red-900/20'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Guardando...
            </>
          ) : (
            'Guardar Movimiento'
          )}
        </button>
      </form>
    </div>
  )
}