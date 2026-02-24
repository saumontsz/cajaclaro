'use client'

import { useState, useTransition } from 'react'
import { Target, Calendar, AlertTriangle, CheckCircle2, TrendingUp, Save, PlusCircle, Trash2, Loader2 } from 'lucide-react'
import { guardarHito, borrarHito } from './actions'

const formatoCLP = (valor: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor);
};

const formatoMiles = (valorStr: string) => {
  if (!valorStr) return '';
  const num = Number(valorStr);
  return new Intl.NumberFormat('es-CL').format(num);
};

// Actualizamos los Props para recibir los datos reales de la base de datos
export default function ProyeccionHitos({ saldoInicial, negocioId, hitosGuardados }: { saldoInicial: number, negocioId: string, hitosGuardados: any[] }) {
  const [nombre, setNombre] = useState('')
  const [costo, setCosto] = useState<string>('')
  const [ahorroMensual, setAhorroMensual] = useState<string>('')
  
  // Si hay hitos guardados, empezamos en la vista de lista
  const [vista, setVista] = useState<'simulador' | 'lista'>(hitosGuardados.length > 0 ? 'lista' : 'simulador')
  const [isPending, startTransition] = useTransition()

  // Cálculos matemáticos del simulador
  const costoNum = Number(costo) || 0;
  const ahorroNum = Number(ahorroMensual) || 0;
  
  const cajaPostCompraHoy = saldoInicial - costoNum;
  const alcanzaHoy = cajaPostCompraHoy >= 0;
  const plataFaltante = Math.max(0, costoNum - saldoInicial);
  
  const mesesEstimados = ahorroNum > 0 && plataFaltante > 0 ? Math.ceil(plataFaltante / ahorroNum) : 0;
  const fechaMeta = new Date();
  if (mesesEstimados > 0) {
    fechaMeta.setMonth(fechaMeta.getMonth() + mesesEstimados);
  }
  const mesMetaStr = fechaMeta.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });

  const inputClasses = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm";

  const manejarGuardado = () => {
    if (!nombre || costoNum <= 0) return;
    startTransition(async () => {
      await guardarHito(negocioId, nombre, costoNum, ahorroNum);
      setNombre(''); setCosto(''); setAhorroMensual('');
      setVista('lista');
    });
  }

  const manejarBorrado = (id: string) => {
    startTransition(async () => {
      await borrarHito(id);
      if (hitosGuardados.length <= 1) setVista('simulador');
    });
  }

  const manejarInputNumerico = (valor: string, setFuncion: (val: string) => void) => {
    const soloNumeros = valor.replace(/\D/g, '');
    setFuncion(soloNumeros);
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm transition-all flex flex-col h-fit">
      
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target size={18} className="text-purple-500" /> 
          {vista === 'simulador' ? 'Simulador de Inversión' : 'Mis Proyectos'}
        </h3>
        <div className="flex items-center gap-2">
          {hitosGuardados.length > 0 && vista === 'simulador' && (
            <button onClick={() => setVista('lista')} className="text-[11px] font-bold text-slate-500 hover:text-purple-500 transition-colors">Ver guardados</button>
          )}
          {vista === 'lista' && (
            <button onClick={() => setVista('simulador')} className="text-[11px] font-bold text-purple-600 flex items-center gap-1 hover:underline">
              <PlusCircle size={12}/> Nuevo
            </button>
          )}
          <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-lg">Empresa</span>
        </div>
      </div>

      {vista === 'simulador' ? (
        <>
          {/* VISTA: SIMULADOR */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">¿Qué quieres lograr o comprar?</label>
              <input type="text" placeholder="Ej: Auto nuevo..." value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Costo Total ($)</label>
                <input type="text" placeholder="0" value={formatoMiles(costo)} onChange={(e) => manejarInputNumerico(e.target.value, setCosto)} className={inputClasses} disabled={isPending}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aporte Mensual ($)</label>
                <input type="text" placeholder="Opcional" value={formatoMiles(ahorroMensual)} onChange={(e) => manejarInputNumerico(e.target.value, setAhorroMensual)} className={inputClasses} disabled={isPending}/>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mt-auto">
            {costoNum === 0 ? (
              <div className="text-center text-slate-400 text-[13px] py-2 italic">Ingresa el costo para ver el impacto en tu caja.</div>
            ) : (
              <div className="space-y-3">
                {alcanzaHoy ? (
                  <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-[13px] leading-tight mb-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <p><strong>¡Puedes pagarlo hoy!</strong> Tu caja es suficiente para cubrir este proyecto.</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500 text-[13px] leading-tight mb-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>Te faltan <strong>{formatoCLP(plataFaltante)}</strong>. {ahorroNum === 0 && "Ingresa un aporte mensual para proyectar la fecha."}</p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-400">Caja al día siguiente</div>
                  <div className={`text-[13px] font-bold ${cajaPostCompraHoy >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatoCLP(cajaPostCompraHoy)}
                  </div>
                </div>

                {!alcanzaHoy && ahorroNum > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                      <Calendar size={14} className="text-purple-500" /> Fecha lograda
                    </div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white capitalize">
                      {mesMetaStr} ({mesesEstimados} meses)
                    </div>
                  </div>
                )}

                {nombre && costoNum > 0 && (
                  <button onClick={manejarGuardado} disabled={isPending} className="w-full mt-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50">
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                    {isPending ? 'Guardando...' : 'Guardar Proyecto'}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* VISTA: LISTA DE PROYECTOS GUARDADOS */
        <div className="space-y-3">
          {hitosGuardados.map((meta) => {
            // Evaluamos el estado EN TIEMPO REAL basándonos en la caja inicial
            const plataFaltaMeta = Math.max(0, meta.costo - saldoInicial);
            const estaCompletado = plataFaltaMeta === 0;
            const mesesFaltan = meta.ahorro > 0 && plataFaltaMeta > 0 ? Math.ceil(plataFaltaMeta / meta.ahorro) : 0;

            return (
              <div key={meta.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30 group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{meta.nombre}</p>
                    <p className="text-[11px] text-slate-500">Costo: {formatoCLP(meta.costo)}</p>
                  </div>
                  <button onClick={() => manejarBorrado(meta.id)} disabled={isPending} className="text-slate-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 disabled:opacity-50">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {estaCompletado ? (
                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">
                       <CheckCircle2 size={12} /> Logrado
                     </span>
                  ) : (
                     <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md flex items-center gap-1">
                       <TrendingUp size={12} /> En progreso {mesesFaltan > 0 ? `(${mesesFaltan} meses)` : '(Falta ahorro)'}
                     </span>
                  )}
                  
                  {!estaCompletado && (
                    <span className="text-[10px] text-slate-500 font-medium">Faltan {formatoCLP(plataFaltaMeta)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}