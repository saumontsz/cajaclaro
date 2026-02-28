'use client'

import { createClient } from '@/utils/supabase/client' 
import { useState } from 'react'
import { Plus, Landmark, AlertCircle, X, TrendingDown, Wallet, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

// 🏦 LISTA DE INSTITUCIONES PARA EVITAR ERRORES ORTOGRÁFICOS
const BANCOS_CHILE = [
  "Banco de Chile", "Banco Santander", "Banco Estado", "BCI", "Scotiabank", 
  "Itaú", "Banco BICE", "Banco Security", "Banco Falabella", "Banco Ripley", 
  "Banco Consorcio", "Coopeuch", "Tenpo", "Mercado Pago", "Mach", "Lider Bci"
];

// 🧠 FUNCIÓN DE NORMALIZACIÓN (Compara "Banco Santander" con "Santander" y detecta que son lo mismo)
const normalizarNombre = (nombre: string) => {
  return nombre
    .toLowerCase()
    .replace(/\bbanco\b/g, '') // Quita la palabra "banco"
    .replace(/\bde\b/g, '')    // Quita conectores
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita tildes
};

type Cuenta = {
  id: string
  nombre: string
  saldo_inicial: number
  saldo_actual: number
  tipo: string
}

type Props = {
  cuentas: Cuenta[]
  planUsuario: string 
}

export default function CuentasSection({ cuentas, planUsuario }: Props) {
  const supabase = createClient()
  const router = useRouter()
  
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreNuevaCuenta, setNombreNuevaCuenta] = useState('')
  const [saldoVisual, setSaldoVisual] = useState('')

  const formatoCLP = (valor: number) => 
    new Intl.NumberFormat('es-CL').format(Math.round(valor));

  const getIcon = (tipo: string, esNegativo: boolean) => {
    const className = esNegativo ? 'text-rose-600' : 'text-slate-400'
    switch (tipo?.toLowerCase()) {
      case 'banco': return <Landmark size={18} className={className} />
      case 'tarjeta': return <CreditCard size={18} className={className} />
      default: return <Wallet size={18} className={className} />
    }
  }

  // 🛡️ VALIDACIÓN DE LÍMITES POR PLAN
  const validarLimiteCuentas = () => {
    const cantidadCuentas = cuentas.length
    const plan = planUsuario.toLowerCase()
    if ((plan === 'semilla' || plan === 'gratis') && cantidadCuentas >= 1) return false
    if (plan === 'personal' && cantidadCuentas >= 5) return false
    return true
  }

  const intentarCrearCuenta = () => {
    if (!validarLimiteCuentas()) {
      setMostrarModalPago(true)
      return
    }
    setMostrarFormulario(true)
  }

  const guardarNuevaCuenta = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Re-validación de seguridad
    if (!validarLimiteCuentas()) {
      setMostrarFormulario(false)
      setMostrarModalPago(true)
      return
    }

    // 2. Verificación inteligente de duplicados (Normalización)
    const nombreNormalizadoNuevo = normalizarNombre(nombreNuevaCuenta);
    const cuentaExistente = cuentas.find(c => normalizarNombre(c.nombre) === nombreNormalizadoNuevo);

    if (cuentaExistente) {
      alert(`La cuenta "${cuentaExistente.nombre}" ya existe. No es necesario crearla de nuevo.`);
      setMostrarFormulario(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser()
    const saldoParaGuardar = parseInt(saldoVisual.replace(/\./g, ''));

    if (user && !isNaN(saldoParaGuardar)) {
      const { data: negocio } = await supabase.from('negocios').select('id').eq('user_id', user.id).single();

      if (negocio) {
        const { error } = await supabase
          .from('cuentas')
          .insert([{ 
            user_id: user.id, 
            negocio_id: negocio.id,
            nombre: nombreNuevaCuenta, 
            saldo_inicial: saldoParaGuardar,
            tipo: 'banco'
          }])

        if (!error) {
          setMostrarFormulario(false)
          setNombreNuevaCuenta('')
          setSaldoVisual('')
          router.refresh()
        }
      }
    }
  }

  return (
    <section className="w-full mb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Cuentas y Bancos</h2>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[9px] font-bold text-blue-600 dark:text-blue-400">
            {cuentas.length} activas
          </span>
        </div>
        <button onClick={intentarCrearCuenta} className="text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:underline flex items-center gap-1.5 transition-all">
          <Plus size={14} /> Nueva Cuenta
        </button>
      </div>

      {/* 🚀 CARRUSEL SNAP-SCROLL */}
      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
          {cuentas.length === 0 ? (
            <button onClick={intentarCrearCuenta} className="w-full py-12 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[32px] hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
              <p className="text-slate-400 text-xs font-medium italic">Registra tu primera cuenta para empezar el flujo.</p>
            </button>
          ) : (
            <>
              {cuentas.map((cuenta) => {
                const esNegativo = cuenta.saldo_actual < 0;
                return (
                  <div key={cuenta.id} className={`min-w-[280px] md:min-w-[310px] snap-start p-6 rounded-[32px] border transition-all shadow-sm hover:shadow-md ${esNegativo ? 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/50' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-2xl border shadow-sm ${esNegativo ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100'}`}>
                        {getIcon(cuenta.tipo, esNegativo)}
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${esNegativo ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${esNegativo ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {esNegativo ? 'Sobrepasado' : 'Activa'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[10px] font-black uppercase mb-0.5 tracking-widest text-slate-400 truncate">{cuenta.nombre}</h3>
                    <p className={`text-2xl font-black tabular-nums tracking-tighter ${esNegativo ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      ${formatoCLP(cuenta.saldo_actual)}
                    </p>
                  </div>
                )
              })}
              {/* ACCESO RÁPIDO AÑADIR */}
              <div onClick={intentarCrearCuenta} className="min-w-[140px] snap-start bg-slate-50/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group/add">
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover/add:scale-110 transition-transform">
                    <Plus size={20} className="text-slate-400" />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Añadir</span>
              </div>
            </>
          )}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-gray-50/90 dark:from-slate-950/90 to-transparent pointer-events-none" />
      </div>

      {/* MODAL: FORMULARIO CON DATALIST */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] max-w-sm w-full border border-gray-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black dark:text-white">Registrar Cuenta</h3>
              <button onClick={() => setMostrarFormulario(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={guardarNuevaCuenta} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Institución</label>
                <input 
                  list="bancos-chile"
                  type="text" required value={nombreNuevaCuenta} 
                  onChange={(e) => setNombreNuevaCuenta(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" 
                  placeholder="Ej: Banco Santander" 
                />
                <datalist id="bancos-chile">
                  {BANCOS_CHILE.map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Saldo Inicial ($)</label>
                <input 
                  type="text" required value={saldoVisual} 
                  onChange={(e) => setSaldoVisual(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, "."))} 
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-bold" 
                  placeholder="0" 
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700">Confirmar Registro</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAYWALL */}
      {mostrarModalPago && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] max-w-md w-full text-center shadow-2xl border border-white/10">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Límite de Cuentas</h3>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Tu plan actual (<strong>{planUsuario}</strong>) ha llegado al máximo de instituciones permitidas. Mejora tu plan para tener control total de tus activos.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/dashboard/planes')} className="bg-blue-600 text-white px-6 py-4 rounded-2xl w-full font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Ver Planes Pro</button>
              <button onClick={() => setMostrarModalPago(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-widest py-2 hover:text-slate-600">Volver al Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}