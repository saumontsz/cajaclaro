'use client'

import { useRef, useState } from 'react'
import { agregarTransaccion } from './actions'
import { PlusCircle, Loader2, DollarSign, FileText, Landmark, AlertCircle, ArrowRightLeft, Lock } from 'lucide-react'

// 🚀 AÑADIMOS 'plan' A LAS PROPS DEL COMPONENTE
export default function NuevoMovimientoForm({ negocioId, cuentasActivas, plan }: { negocioId: string, cuentasActivas: any[], plan: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  
  const [isPending, setIsPending] = useState(false)
  const [tipo, setTipo] = useState('gasto') // 'ingreso', 'gasto', o 'transferencia'
  
  const [montoVisual, setMontoVisual] = useState('') 
  const [montoReal, setMontoReal] = useState('')

  // ESTADOS PARA RECURRENCIA
  const [esRecurrente, setEsRecurrente] = useState(false)
  const [frecuencia, setFrecuencia] = useState('mensual')

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpio = e.target.value.replace(/\D/g, '')
    if (valorLimpio === '') {
      setMontoVisual(''); setMontoReal(''); return
    }
    setMontoReal(valorLimpio)
    const valorFormateado = new Intl.NumberFormat('es-CL').format(Number(valorLimpio))
    setMontoVisual(valorFormateado)
  }

  const handleSubmit = async (formData: FormData) => {
    if (!cuentasActivas || cuentasActivas.length === 0) {
      alert("Debes crear al menos una cuenta antes de registrar movimientos.")
      return
    }

    if (tipo === 'transferencia' && formData.get('cuenta_origen') === formData.get('cuenta_destino')) {
      alert("La cuenta de origen y destino no pueden ser la misma.")
      return
    }

    setIsPending(true)
    const res = await agregarTransaccion(formData)
    
    if (res?.success) {
      formRef.current?.reset()
      setTipo('gasto')
      setMontoVisual('')
      setMontoReal('')
      setEsRecurrente(false)
      setFrecuencia('mensual')
    } else if (res?.error) {
      alert(res.error) // Mostramos el error si el backend bloquea por plan
    }
    setIsPending(false)
  }

  // Colores dinámicos del header según el tipo
  const colorTema = tipo === 'ingreso' ? 'emerald' : tipo === 'gasto' ? 'red' : 'blue';

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-transparent transition-colors relative">
      <div className="flex items-center gap-2 mb-6">
        <div className={`bg-${colorTema}-100 dark:bg-${colorTema}-900/30 p-1.5 rounded-lg transition-colors`}>
          <PlusCircle className={`text-${colorTema}-600 dark:text-${colorTema}-400`} size={18} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nuevo Movimiento</h3>
      </div>

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="negocio_id" value={negocioId} />
        <input type="hidden" name="es_recurrente" value={esRecurrente.toString()} />
        {esRecurrente && <input type="hidden" name="frecuencia" value={frecuencia} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SELECTOR DE TIPO */}
          <div className={tipo === 'transferencia' ? 'md:col-span-2' : ''}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Tipo de Registro</label>
            <div className="flex bg-gray-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-gray-100 dark:border-slate-800">
              <button type="button" onClick={() => setTipo('ingreso')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tipo === 'ingreso' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Ingreso</button>
              <button type="button" onClick={() => setTipo('gasto')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tipo === 'gasto' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Gasto</button>
              <button type="button" onClick={() => setTipo('transferencia')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tipo === 'transferencia' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Traspaso</button>
            </div>
            <input type="hidden" name="tipo" value={tipo} />
          </div>

          {/* SELECTORES DE CUENTA(S) DINÁMICOS */}
          {tipo !== 'transferencia' ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Cuenta</label>
              <div className="relative">
                <Landmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select name="cuenta_id" required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-slate-500 appearance-none cursor-pointer transition-all">
                  {!cuentasActivas || cuentasActivas.length === 0 ? <option value="">No hay cuentas</option> : cuentasActivas.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1"><ArrowRightLeft size={10} className="text-red-500"/> Origen (Sale dinero)</label>
                <select name="cuenta_origen" required className="w-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-slate-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer transition-all">
                  {cuentasActivas.map((c: any) => <option key={`ori-${c.id}`} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1"><ArrowRightLeft size={10} className="text-emerald-500"/> Destino (Entra dinero)</label>
                <select name="cuenta_destino" required className="w-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-slate-900 dark:text-white text-sm font-medium rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition-all">
                  {cuentasActivas.map((c: any) => <option key={`des-${c.id}`} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* MONTO */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Monto ($)</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" inputMode="numeric" placeholder="0" 
              value={montoVisual} onChange={handleMontoChange} required
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white text-lg font-black rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            <input type="hidden" name="monto" value={montoReal} />
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Concepto</label>
          <div className="relative">
            <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              name="descripcion" type="text" 
              placeholder={tipo === 'transferencia' ? "Ej: Pago Tarjeta CMR" : "Ej: Pago de factura, Arriendo..."} required
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* 🔒 SWITCH DE RECURRENCIA (DISEÑO PROFESIONAL SAAS) */}
        {tipo !== 'transferencia' && (
          <div className={`p-4 rounded-2xl border transition-all ${
            plan === 'gratis' 
              ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800/50 opacity-60 cursor-not-allowed select-none' 
              : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Movimiento Recurrente</p>
                  {plan === 'gratis' && (
                    <span className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                      <Lock size={10} /> Pro
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Automatiza este registro a futuro</p>
              </div>
              
              <label className={`relative inline-flex items-center ${plan === 'gratis' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={plan !== 'gratis' && esRecurrente} // Si es gratis, jamás se puede activar
                  onChange={() => plan !== 'gratis' && setEsRecurrente(!esRecurrente)} 
                  disabled={plan === 'gratis'} 
                />
                <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  plan === 'gratis' 
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700' 
                    : 'bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white'
                }`}></div>
              </label>
            </div>

            {esRecurrente && plan !== 'gratis' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Se repite de forma</label>
                <div className="grid grid-cols-3 gap-2">
                  {['semanal', 'mensual', 'anual'].map((f) => (
                    <button
                      key={f} type="button" onClick={() => setFrecuencia(f)}
                      className={`py-2 text-[11px] font-bold rounded-xl capitalize transition-all ${frecuencia === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(!cuentasActivas || cuentasActivas.length === 0) && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase">
            <AlertCircle size={14} /> Crea una cuenta primero
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending || !cuentasActivas || cuentasActivas.length === 0}
          className={`mt-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
            tipo === 'ingreso' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 
            tipo === 'gasto' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 
            'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
          }`}
        >
          {isPending ? <><Loader2 className="animate-spin" size={18} /> Guardando...</> : `Guardar ${tipo === 'ingreso' ? 'Ingreso' : tipo === 'gasto' ? 'Gasto' : 'Traspaso'}`}
        </button>
      </form>
    </div>
  )
}