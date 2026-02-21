'use client'

import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

interface Props {
  transacciones: any[];
}

export default function BotonExportarExcel({ transacciones }: Props) {
  const exportar = () => {
    if (!transacciones || transacciones.length === 0) {
      alert("No hay movimientos para exportar.");
      return;
    }

    // 1. Preparamos los datos limpios para el Excel
    const datosExcel = transacciones.map(tx => ({
      Fecha: new Date(tx.created_at).toLocaleDateString('es-CL'),
      Tipo: tx.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      Concepto: tx.descripcion,
      'Monto ($)': Number(tx.monto)
    }));

    // 2. Creamos la hoja de cálculo
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    
    // 3. Añadimos la hoja al libro
    XLSX.utils.book_append_sheet(libro, hoja, "Movimientos");

    // 4. Forzamos la descarga en el navegador
    XLSX.writeFile(libro, "CajaClaro_Reporte.xlsx");
  }

  return (
    <button 
      onClick={exportar}
      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-100 shadow-sm"
      title="Descargar historial en Excel"
    >
      <Download size={14} />
      Exportar
    </button>
  )
}