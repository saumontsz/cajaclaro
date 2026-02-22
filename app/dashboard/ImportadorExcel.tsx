'use client'

import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { importarMasivo } from './actions'

export default function ImportadorExcel({ negocioId }: { negocioId: string }) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'exito' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')

  const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEstado('cargando')
    setMensaje('Procesando archivo...')

    try {
      const reader = new FileReader()
      reader.onload = async (evento) => {
        try {
          const data = new Uint8Array(evento.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const primeraHoja = workbook.Sheets[workbook.SheetNames[0]]
          const datosJson = XLSX.utils.sheet_to_json(primeraHoja)

          if (datosJson.length === 0) throw new Error('El archivo está vacío.')

          const resultado = await importarMasivo(negocioId, datosJson)

          if (resultado?.error) throw new Error('Error al guardar en base de datos.')

          setEstado('exito')
          setMensaje(`¡${datosJson.length} movimientos importados!`)
          setTimeout(() => setEstado('idle'), 3000)

        } catch (error: any) {
          setEstado('error')
          setMensaje(error.message || 'Formato inválido.')
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      setEstado('error')
      setMensaje('Error al leer el archivo.')
    }
  }

  return (
    // CAMBIO 1: Quitamos h-full para que no se estire
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all flex flex-col">
      
      {/* Encabezado más compacto */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-emerald-500" /> Importación Masiva
        </h3>
        <p className="text-[11px] text-slate-500 leading-tight">
          Columnas requeridas: <strong className="text-slate-700 dark:text-slate-300">Concepto</strong>, <strong className="text-slate-700 dark:text-slate-300">Monto</strong> y <strong className="text-slate-700 dark:text-slate-300">Tipo</strong>.
        </p>
      </div>

      {/* CAMBIO 2: Área de interacción con altura fija (h-52) para que se vea "cuadrada" */}
      <div className="w-full h-52 mt-2">
        
        {estado === 'idle' && (
          <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group px-4 text-center">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <UploadCloud size={24} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">Arrastra tu Excel aquí</span>
            <span className="text-xs text-slate-500 mt-1">o haz clic para buscar (.xlsx)</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={manejarArchivo} />
          </label>
        )}

        {estado === 'cargando' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Loader2 size={28} className="animate-spin text-emerald-500 mb-3" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">{mensaje}</span>
          </div>
        )}

        {estado === 'exito' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center p-4">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{mensaje}</span>
          </div>
        )}

        {estado === 'error' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-center p-4">
            <AlertCircle size={28} className="text-red-500 mb-2" />
            <span className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Hubo un problema</span>
            <span className="text-xs text-red-600 dark:text-red-300 block max-w-[200px] truncate">{mensaje}</span>
            <button onClick={() => setEstado('idle')} className="mt-3 text-xs bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium hover:bg-red-50 transition-colors">
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}