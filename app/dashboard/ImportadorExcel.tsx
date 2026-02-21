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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="text-green-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Importación Masiva</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Sube un archivo Excel (.xlsx) o CSV. Asegúrate de tener columnas para <strong>"Tipo"</strong> (ingreso/gasto), <strong>"Monto"</strong> y <strong>"Descripcion"</strong>.
      </p>

      {/* Zona de Drag & Drop */}
      {!archivo && (
        <div 
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault()
            setArrastrando(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              procesarArchivo(e.dataTransfer.files[0])
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            arrastrando ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <UploadCloud className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-sm text-gray-600 mb-2">Arrastra tu archivo aquí o</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700"
          >
            explorar archivos
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && procesarArchivo(e.target.files[0])}
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </div>
      )}

      {/* Vista previa y confirmación */}
      {archivo && datosPreview.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">{archivo.name}</span>
            <button onClick={() => setArchivo(null)} className="text-xs text-red-500 hover:text-red-700">Cancelar</button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Vista Previa de Datos</p>
            <div className="space-y-2">
              {datosPreview.map((tx, i) => (
                <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-100">
                  <span className="text-gray-600 truncate max-w-[150px]">{tx.descripcion}</span>
                  <span className={tx.tipo === 'ingreso' ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>
                    {tx.tipo === 'ingreso' ? '+' : '-'}${tx.monto}
                  </span>
                </div>
              ))}
              <p className="text-xs text-center text-gray-400 mt-2">... y más filas</p>
            </div>
          </div>

          <button 
            onClick={subirDatos}
            disabled={cargando}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {cargando ? 'Importando...' : 'Confirmar e Importar'}
          </button>
        </div>
      )}

      {/* Mensajes de éxito/error */}
      {mensaje && (
        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
          mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.tipo === 'exito' ? <CheckCircle size={18} className="shrink-0 text-green-600 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />}
          <p>{mensaje.texto}</p>
        </div>
      )}
    </div>
  )
}