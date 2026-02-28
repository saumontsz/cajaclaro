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
  const mesMetaStr = fechaMeta.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  // Clases actualizadas al diseño limpio (suave, sin bordes pesados)
  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium";

  const manejarGuardado = () => {
    if (!nombre || costoNum <= 0) return;
    startTransition(async () => {
      const res = await guardarHito(negocioId, nombre, costoNum, ahorroNum);
      if (res && res.success) {
        setNombre(''); setCosto(''); setAhorroMensual('');
        setVista('lista');
      }
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-transparent transition-all flex flex-col h-fit">
      
      {/* HEADER DEL COMPONENTE */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
            <Target size={16} className="text-purple-600 dark:text-purple-400" /> 
          </div>
          {vista === 'simulador' ? 'Simulador de Compras' : 'Mis Proyectos'}
        </h3>
        <div className="flex items-center gap-3">
          {hitosGuardados.length > 0 && vista === 'simulador' && (
            <button onClick={() => setVista('lista')} className="text-[11px] font-bold text-slate-400 hover:text-purple-600 transition-colors">Ver guardados</button>
          )}
          {vista === 'lista' && (
            <button onClick={() => setVista('simulador')} className="text-[11px] font-bold text-purple-600 flex items-center gap-1 hover:underline bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
              <PlusCircle size={12}/> Nuevo
            </button>
          )}
        </div>
      </div>

      {vista === 'simulador' ? (
        <>
          {/* VISTA: SIMULADOR */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">¿Qué quieres lograr o comprar?</label>
              <input type="text" placeholder="Ej: Auto nuevo, Servidor..." value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Costo Total ($)</label>
                <input type="text" placeholder="0" value={formatoMiles(costo)} onChange={(e) => manejarInputNumerico(e.target.value, setCosto)} className={inputClasses} disabled={isPending}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aporte Mensual ($)</label>
                <input type="text" placeholder="Opcional" value={formatoMiles(ahorroMensual)} onChange={(e) => manejarInputNumerico(e.target.value, setAhorroMensual)} className={inputClasses} disabled={isPending}/>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 mt-auto shadow-inner">
            {costoNum === 0 ? (
              <div className="text-center text-slate-400 text-[12px] py-4 italic font-medium">Ingresa el costo para ver el impacto en tu caja disponible.</div>
            ) : (
              <div className="space-y-4">
                {alcanzaHoy ? (
                  <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 text-[13px] leading-tight bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <p><strong>¡Puedes pagarlo hoy!</strong> Tu caja disponible es suficiente para cubrir este proyecto al contado.</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-amber-700 dark:text-amber-500 text-[13px] leading-tight bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <p>Te faltan <strong>{formatoCLP(plataFaltante)}</strong>. {ahorroNum === 0 && "Ingresa un aporte mensual para proyectar la fecha de logro."}</p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Caja al día siguiente</div>
                  <div className={`text-base font-black ${cajaPostCompraHoy >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatoCLP(cajaPostCompraHoy)}
                  </div>
                </div>

                {!alcanzaHoy && ahorroNum > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                      <Calendar size={14} className="text-purple-500" /> Fecha estimada
                    </div>
                    <div className="text-[13px] font-bold text-slate-800 dark:text-white capitalize bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                      {mesMetaStr} <span className="text-slate-400 font-normal">({mesesEstimados} meses)</span>
                    </div>
                  </div>
                )}

                {nombre && costoNum > 0 && (
                  <button onClick={manejarGuardado} disabled={isPending} className="w-full mt-4 py-3 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:shadow-none">
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    {isPending ? 'Guardando...' : 'Guardar Proyecto'}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* VISTA: LISTA DE PROYECTOS GUARDADOS */
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
          {hitosGuardados.map((meta) => {
            // Evaluamos el estado EN TIEMPO REAL basándonos en la caja disponible
            const plataFaltaMeta = Math.max(0, meta.costo - saldoInicial);
            const estaCompletado = plataFaltaMeta === 0;
            const mesesFaltan = meta.ahorro > 0 && plataFaltaMeta > 0 ? Math.ceil(plataFaltaMeta / meta.ahorro) : 0;

            return (
              <div key={meta.id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-800/30 group hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors shadow-sm relative overflow-hidden">
                
                {/* Barra de progreso de fondo suave si aplica */}
                {!estaCompletado && meta.ahorro > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 bg-purple-500/20" style={{ width: `${Math.min(100, ((meta.costo - plataFaltaMeta) / meta.costo) * 100)}%` }}></div>
                )}

                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{meta.nombre}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Meta: {formatoCLP(meta.costo)}</p>
                  </div>
                  <button onClick={() => manejarBorrado(meta.id)} disabled={isPending} className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {estaCompletado ? (
                     <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                       <CheckCircle2 size={12} /> Caja Suficiente
                     </span>
                  ) : (
                     <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-100 dark:border-transparent">
                       <TrendingUp size={12} /> {mesesFaltan > 0 ? `En ${mesesFaltan} meses` : 'Falta ahorro recurrente'}
                     </span>
                  )}
                  
                  {!estaCompletado && (
                    <span className="text-[10px] text-slate-500 font-bold bg-gray-50 dark:bg-slate-900 px-2 py-1 rounded-lg">Faltan {formatoCLP(plataFaltaMeta)}</span>
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