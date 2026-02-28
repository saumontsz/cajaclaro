'use client'

import { useState, useEffect } from 'react'
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Info, 
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Landmark,
  Sparkles
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { importarMasivo } from './actions'
import { createClient } from '@/utils/supabase/client'

// 🧠 UTILIDAD DE NORMALIZACIÓN: Une "Santander" con "Banco Santander"
const normalizarNombre = (nombre: string) => {
  if (!nombre) return "";
  return nombre
    .toLowerCase()
    .replace(/\bbanco\b/g, '') // Quita la palabra "banco"
    .replace(/\bde\b/g, '')    // Quita conectores
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita tildes
};

interface ReporteImportacion {
  procesadas: number;
  banco?: string;
  descartadas: { fila: number; motivo: string; datos: any }[];
}

export default function ImportadorExcel({ negocioId }: { negocioId: string }) {
  const supabase = createClient()
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'exito' | 'error' | 'parcial'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [reporte, setReporte] = useState<ReporteImportacion | null>(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  const [cuentas, setCuentas] = useState<any[]>([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string>('') 

  useEffect(() => {
    async function cargarCuentas() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('cuentas').select('id, nombre').eq('user_id', user.id)
        if (data) setCuentas(data)
      }
    }
    cargarCuentas()
  }, [supabase])

  const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEstado('cargando')
    setMensaje('Iniciando Mapeo Inteligente...')
    setReporte(null)
    setMostrarDetalles(false)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const nombreHoja = workbook.SheetNames[0]
      const datosJson: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja])

      if (datosJson.length === 0) throw new Error(`El archivo Excel está vacío.`)

      // 🚀 LÓGICA SMART: Pre-procesamiento de nombres de cuenta
      // Si el usuario no seleccionó una cuenta manual, intentamos mapear el Excel a cuentas existentes
      const datosProcesados = datosJson.map((fila) => {
        if (!cuentaSeleccionada && fila.Cuenta) {
          const nombreExcel = normalizarNombre(fila.Cuenta);
          const cuentaMatch = cuentas.find(c => normalizarNombre(c.nombre) === nombreExcel);
          
          if (cuentaMatch) {
            return { ...fila, cuenta_id: cuentaMatch.id }; // Inyectamos el ID real
          }
        }
        return fila;
      });

      const resultado = await importarMasivo(negocioId, datosProcesados, cuentaSeleccionada)
      
      if (resultado?.error) {
        if (resultado.descartadas) {
           setReporte({ procesadas: 0, descartadas: resultado.descartadas })
           setEstado('parcial')
           setMensaje('No se pudo importar ningún movimiento válido.')
           return;
        }
        throw new Error(resultado.error)
      }

      setReporte({
        procesadas: resultado.procesadas || 0,
        banco: resultado.banco,
        descartadas: resultado.descartadas || []
      })

      if (resultado.descartadas && resultado.descartadas.length > 0) {
        setEstado('parcial')
        setMensaje(`Sincronización parcial: ${resultado.procesadas} movimientos cargados.`)
      } else {
        setEstado('exito')
        setMensaje(`¡${resultado.procesadas} movimientos sincronizados con éxito!`)
        setTimeout(() => setEstado('idle'), 5000)
      }

    } catch (error: any) {
      setEstado('error')
      setMensaje(error.message || 'Error al procesar el Excel.')
    }
  }

  const reiniciar = () => {
    setEstado('idle')
    setReporte(null)
    setMostrarDetalles(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800/50 transition-all flex flex-col">
      
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
              <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            Importador Inteligente
          </h3>
          <div className="flex gap-2">
            <span className="text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> Smart Match
            </span>
          </div>
        </div>

        {/* SELECTOR DE CUENTA CON LÓGICA SMART */}
        <div className="mb-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destino de Fondos</label>
          <div className="relative group">
            <Landmark size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <select 
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition-all cursor-pointer"
            >
              <option value="">Auto-mapeo Inteligente (Fuzzy Matching)</option>
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <p className="text-[9px] text-slate-400 mt-2 ml-1 italic leading-tight">
            * Si eliges Auto-mapeo, el sistema vinculará nombres como "Santander" a tu cuenta "Banco Santander" automáticamente.
          </p>
        </div>
      </div>

      {/* ÁREA DE CARGA DINÁMICA */}
      <div className={`w-full ${estado === 'parcial' ? 'h-auto' : 'h-48'} transition-all duration-300`}>
        {estado === 'idle' && (
          <label className="w-full h-full min-h-[192px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group px-6 text-center">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Cargar planilla bancaria</span>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">Arrastra tu archivo .xlsx o .xls</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={manejarArchivo} />
          </label>
        )}

        {estado === 'cargando' && (
          <div className="w-full h-full min-h-[192px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-slate-800">
            <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">{mensaje}</span>
          </div>
        )}

        {estado === 'exito' && (
          <div className="w-full h-full min-h-[192px] flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 text-center p-6">
            <div className="bg-emerald-500 p-3 rounded-full mb-4 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{mensaje}</span>
            <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/60 mt-2 uppercase font-black tracking-[0.2em]">Flujo Actualizado</p>
          </div>
        )}

        {/* ÉXITO PARCIAL */}
        {estado === 'parcial' && reporte && (
          <div className="w-full flex flex-col bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[32px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-amber-800 dark:text-amber-400">Importación Parcial</span>
                  <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">
                    {reporte.procesadas} OK • {reporte.descartadas.length} Omitidos
                  </span>
                </div>
              </div>
              <button onClick={reiniciar} className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-700 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all">Cerrar</button>
            </div>

            <div className="mt-2">
              <button 
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
                className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 bg-amber-100/50 dark:bg-amber-900/20 px-4 py-2.5 rounded-xl transition-all"
              >
                <span>Ver incidencias detectadas</span>
                {mostrarDetalles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {mostrarDetalles && (
                <div className="mt-3 max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {reporte.descartadas.map((err, i) => (
                    <div key={i} className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20 text-left">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="text-amber-500">Fila {err.fila}:</span> {err.motivo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {estado === 'error' && (
          <div className="w-full h-full min-h-[192px] flex flex-col items-center justify-center bg-rose-50/50 dark:bg-rose-900/10 rounded-[32px] border border-rose-100 dark:border-rose-900/30 text-center p-6">
            <AlertCircle size={32} className="text-rose-500 mb-3" />
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-4">{mensaje}</span>
            <button onClick={reiniciar} className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-rose-200 text-rose-600 px-6 py-2.5 rounded-xl hover:bg-rose-50 transition-all">Reintentar</button>
          </div>
        )}
      </div>

      {/* FOOTER PDF */}
      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
        <div className="flex items-center gap-4 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
            <FileText size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lectura de Cartolas PDF</p>
            <p className="text-[9px] text-slate-400 font-medium">Bancos de Chile, Santander, BICE y más.</p>
          </div>
          <span className="text-[8px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg uppercase tracking-widest">Desarrollo</span>
        </div>
      </div>
    </div>
  )
}