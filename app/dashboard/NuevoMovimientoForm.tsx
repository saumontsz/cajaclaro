'use client'

import { useState, useRef } from 'react'
import { PlusCircle, CheckCircle2 } from 'lucide-react'
import { agregarTransaccion } from './actions'

const formatoMiles = (valorStr: string) => {
  if (!valorStr) return '';
  const num = Number(valorStr);
  return new Intl.NumberFormat('es-CL').format(num);
};

export default function NuevoMovimientoForm({ negocioId }: { negocioId: string }) {
  const [monto, setMonto] = useState('')
  const [exito, setExito] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const manejarInputNumerico = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '');
    setMonto(soloNumeros);
  }

  const manejarSubmit = async (formData: FormData) => {
    // 1. Ejecutamos la acción en la base de datos
    await agregarTransaccion(formData);
    
    // 2. Limpiamos el formulario para el siguiente registro
    setMonto('');
    formRef.current?.reset();
    
    // 3. Mostramos el mensaje de éxito temporal
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <PlusCircle size={18} className="text-blue-600" /> Nuevo Movimiento
      </h3>

      {/* ALERTA DE ÉXITO */}
      {exito && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <span>¡Guardado con éxito!</span>
        </div>
      )}

      <form ref={formRef} action={manejarSubmit} className="flex flex-col gap-4">
        {/* Datos ocultos que necesita la base de datos */}
        <input type="hidden" name="negocio_id" value={negocioId} />
        <input type="hidden" name="monto" value={monto} /> {/* Este guarda el número real "15000" */}

        <select name="tipo" className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
        
        {/* Input visible con el separador de miles "15.000" */}
        <input 
          type="text" 
          placeholder="Monto ($)" 
          required 
          value={formatoMiles(monto)}
          onChange={(e) => manejarInputNumerico(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
        />
        
        <input name="descripcion" type="text" placeholder="Concepto" required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
        
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">Guardar</button>
      </form>
    </div>
  )
}