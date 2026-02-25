'use client'

import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Calendar, Info } from 'lucide-react'
import * as XLSX from 'xlsx'
import { importarMasivo } from './actions'

export default function ImportadorExcel({ negocioId }: { negocioId: string }) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'exito' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')

  const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEstado('cargando')
    setMensaje('Analizando primera hoja...')

    try {
      const reader = new FileReader()
      reader.onload = async (evento) => {
        try {
          const data = new Uint8Array(evento.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Procesamos la primera hoja (donde suelen estar los datos reales)
          const nombreHoja = workbook.SheetNames[0]
          const primeraHoja = workbook.Sheets[nombreHoja]
          const datosJson = XLSX.utils.sheet_to_json(primeraHoja)

          if (datosJson.length === 0) throw new Error(`La hoja "${nombreHoja}" está vacía.`)

          // El servidor filtrará automáticamente filas de "Total" o "Promedio"
          const resultado = await importarMasivo(negocioId, datosJson)

          if (resultado?.error) throw new Error(resultado.error)

          setEstado('exito')
          setMensaje(`¡${datosJson.length} movimientos sincronizados!`)
          setTimeout(() => setEstado('idle'), 4000)

        } catch (error: any) {
          setEstado('error')
          setMensaje(error.message || 'Error en el formato del Excel.')
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      setEstado('error')
      setMensaje('No se pudo leer el archivo.')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all flex flex-col">
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-500" /> Importación Masiva
          </h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            Auto-Mapeo Activo
          </span>
        </div>

        {/* MODIFICACIÓN: Guía de Formato Ideal para el Usuario */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
            <Info size={12} /> Columnas recomendadas:
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {['Fecha', 'Concepto', 'Monto', 'Tipo'].map((col) => (
              <div key={col} className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{col}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-500 mt-3 leading-tight italic">
            * El sistema detecta y omite automáticamente celdas con fórmulas de total o promedios.
          </p>
        </div>
      </div>

      <div className="w-full h-48">
        {estado === 'idle' && (
          <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group px-4 text-center">
            <UploadCloud size={28} className="text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Subir historial de meses anteriores</span>
            <span className="text-[10px] text-slate-500 mt-1">Soporta archivos .xlsx con múltiples filas</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={manejarArchivo} />
          </label>
        )}

        {estado === 'cargando' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Loader2 size={28} className="animate-spin text-emerald-500 mb-2" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 animate-pulse">{mensaje}</span>
          </div>
        )}

        {estado === 'exito' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center p-4">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{mensaje}</span>
            <p className="text-[10px] text-emerald-600 mt-1">Los gráficos se han actualizado con éxito.</p>
          </div>
        )}

        {estado === 'error' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-center p-4">
            <AlertCircle size={28} className="text-red-500 mb-2" />
            <span className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">{mensaje}</span>
            <button onClick={() => setEstado('idle')} className="mt-2 text-[10px] bg-white dark:bg-slate-900 border border-red-200 text-red-600 px-3 py-1 rounded-lg font-bold">Reintentar</button>
          </div>
        )}
      </div>
    </div>
  )
}