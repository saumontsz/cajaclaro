'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { importarTransaccionesMasivas } from './actions'

export default function ImportadorExcel({ negocioId }: { negocioId: string }) {
  const [arrastrando, setArrastrando] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [datosPreview, setDatosPreview] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Procesar el archivo Excel
  const procesarArchivo = (file: File) => {
    setArchivo(file)
    setMensaje(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const primeraHojaName = workbook.SheetNames[0]
        const hoja = workbook.Sheets[primeraHojaName]
        
        // Convertir la hoja a JSON
        const json: any[] = XLSX.utils.sheet_to_json(hoja)
        
        // Buscar columnas clave (asumimos que el Excel tiene columnas parecidas a: tipo, monto, descripcion)
        const transaccionesFormateadas = json.map(fila => {
          // Buscamos las llaves ignorando mayúsculas/minúsculas
          const keys = Object.keys(fila)
          const keyTipo = keys.find(k => k.toLowerCase().includes('tipo'))
          const keyMonto = keys.find(k => k.toLowerCase().includes('monto') || k.toLowerCase().includes('valor'))
          const keyDesc = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('concepto'))
          
          return {
            tipo: keyTipo ? fila[keyTipo] : 'ingreso', // Por defecto ingreso si no especifica
            monto: keyMonto ? fila[keyMonto] : 0,
            descripcion: keyDesc ? fila[keyDesc] : 'Importado desde Excel'
          }
        }).filter(tx => tx.monto > 0) // Filtramos filas vacías

        setDatosPreview(transaccionesFormateadas.slice(0, 3)) // Mostramos solo 3 de ejemplo
      } catch (error) {
        setMensaje({ tipo: 'error', texto: 'El archivo no tiene un formato válido.' })
      }
    }
    reader.readAsBinaryString(file)
  }

  const subirDatos = async () => {
    if (datosPreview.length === 0) return
    setCargando(true)
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const json: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
      
      const transacciones = json.map(fila => {
        const keys = Object.keys(fila)
        const keyTipo = keys.find(k => k.toLowerCase().includes('tipo'))
        const keyMonto = keys.find(k => k.toLowerCase().includes('monto') || k.toLowerCase().includes('valor'))
        const keyDesc = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('concepto'))
        return {
          tipo: keyTipo ? fila[keyTipo] : 'ingreso',
          monto: keyMonto ? fila[keyMonto] : 0,
          descripcion: keyDesc ? fila[keyDesc] : 'Importación Excel'
        }
      }).filter(tx => tx.monto > 0)

      const res = await importarTransaccionesMasivas(transacciones, negocioId)
      
      if (res?.error) {
        setMensaje({ tipo: 'error', texto: res.error })
      } else {
        setMensaje({ tipo: 'exito', texto: `¡${transacciones.length} movimientos importados correctamente!` })
        setArchivo(null)
        setDatosPreview([])
      }
      setCargando(false)
    }
    reader.readAsBinaryString(archivo!)
  }

  return (
    // Tarjeta principal oscura
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mt-8 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="text-green-600 dark:text-green-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Importación Masiva</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Sube un archivo Excel (.xlsx) o CSV. Asegúrate de tener columnas para <strong>"Tipo"</strong>, <strong>"Monto"</strong> y <strong>"Descripcion"</strong>.
      </p>

      {!archivo && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => { /* ... lógica drop ... */ }}
          // Zona de drop oscura
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            arrastrando ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <UploadCloud className="mx-auto text-gray-400 dark:text-slate-500 mb-3" size={32} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Arrastra tu archivo aquí o</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 dark:text-blue-500 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-400"
          >
            explorar archivos
          </button>
          {/* ... input hidden ... */}
        </div>
      )}

      {/* ... (El resto de la vista previa y mensajes también necesita ajustes similares si los usas) ... */}
    </div>
  )
}