'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface BotonExportarExcelProps {
  transacciones: any[];
}

export default function BotonExportarExcel({ transacciones }: BotonExportarExcelProps) {
  const [descargando, setDescargando] = useState(false)

  const exportar = () => {
    setDescargando(true)

    try {
      // 1. Limpiamos y formateamos los datos para el Excel
      const datosFormateados = transacciones.map(tx => ({
        Fecha: new Date(tx.created_at).toLocaleDateString('es-CL'),
        Concepto: tx.descripcion,
        Tipo: tx.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
        'Monto ($)': Number(tx.monto)
      }))

      // 2. Creamos el libro virtual y la hoja de cálculo
      const hoja = XLSX.utils.json_to_sheet(datosFormateados)
      const libro = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(libro, hoja, 'Historial Flujent')

      // 3. MAGIA CTO: Ajustamos el ancho de las columnas del Excel
      hoja['!cols'] = [
        { wch: 12 }, // Columna A: Fecha (12 caracteres)
        { wch: 40 }, // Columna B: Concepto (40 caracteres de ancho)
        { wch: 10 }, // Columna C: Tipo
        { wch: 15 }  // Columna D: Monto
      ]

      // 4. Generamos el nombre del archivo con la fecha de hoy
      const fechaHoy = new Date().toLocaleDateString('es-CL').replace(/\//g, '-')
      const nombreArchivo = `Flujent_Movimientos_${fechaHoy}.xlsx`

      // 5. Descargamos el archivo
      XLSX.writeFile(libro, nombreArchivo)
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Hubo un problema al exportar los datos.")
    } finally {
      // Damos un pequeño respiro artificial para que el usuario vea la animación
      setTimeout(() => setDescargando(false), 500)
    }
  }

  return (
    <button 
      onClick={exportar}
      disabled={descargando || transacciones.length === 0}
      className="text-xs flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      title="Exportar a Excel"
    >
      {descargando ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {descargando ? 'Exportando...' : 'Exportar'}
    </button>
  )
}