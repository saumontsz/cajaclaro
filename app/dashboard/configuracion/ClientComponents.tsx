'use client'

import { useState } from 'react'
// Aquí importamos las 3 funciones, ahora SÍ existen en actions.ts
import { actualizarNegocio, actualizarPassword, cancelarPlan } from './actions'
import { Loader2, Save, AlertTriangle, CheckCircle, Lock, CalendarOff, CalendarCheck } from 'lucide-react'

// --- COMPONENTE 1: FORMULARIO DE NEGOCIO ---
export function BusinessForm({ negocio }: { negocio: any }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await actualizarNegocio(formData)
    setLoading(false)
    if (res?.success) {
      setMsg(res.success)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="negocio_id" value={negocio.id} />
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nombre del Espacio / Empresa</label>
        <input 
          name="nombre" 
          defaultValue={negocio.nombre}
          required
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
      <button 
        disabled={loading} 
        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        Guardar Cambios
      </button>
      {msg && <p className="text-green-500 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><CheckCircle size={14} /> {msg}</p>}
    </form>
  )
}

// --- COMPONENTE 2: TARJETA DE PLAN (Lógica Netflix) ---
export function PlanCard({ negocio }: { negocio: any }) {
  const [loading, setLoading] = useState(false)
  
  const handleCancel = async () => {
    if (!confirm("¿Estás seguro que deseas cancelar la renovación automática? Seguirás teniendo acceso a tus beneficios Premium hasta que expire tu fecha actual.")) return;
    
    setLoading(true)
    await cancelarPlan(negocio.id)
    setLoading(false)
  }

  const esGratis = negocio.plan === 'gratis'
  // Si no existe la columna estado, asumimos que está activa
  const estaCancelado = negocio.estado_suscripcion === 'cancelada'
  
  // Formateamos la fecha usando tu columna 'fecha_expiracion'
  const fechaFin = negocio.fecha_expiracion 
    ? new Date(negocio.fecha_expiracion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Indefinido'

  return (
    <div className="space-y-6">
      {/* CABECERA DEL PLAN */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Plan Actual</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-slate-900 dark:text-white capitalize">{negocio.plan}</p>
            {!esGratis && (
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${estaCancelado ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'}`}>
                 {estaCancelado ? 'No se renueva' : 'Activo'}
               </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${esGratis ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          {esGratis ? 'Básico' : 'Premium'}
        </span>
      </div>

      {/* DETALLES DE VIGENCIA (Solo visible si NO es gratis) */}
      {!esGratis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          
          {/* INFORMACIÓN DE FECHA */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
            {estaCancelado ? <CalendarOff size={18} className="text-slate-500 dark:text-slate-400 mt-0.5" /> : <CalendarCheck size={18} className="text-blue-500 dark:text-blue-400 mt-0.5" />}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {estaCancelado ? 'Tu acceso finaliza el:' : 'Próxima renovación:'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                {fechaFin}
              </p>
              {estaCancelado && (
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Tu cuenta volverá automáticamente al plan Gratis después de esta fecha. No perderás tus datos históricos.
                </p>
              )}
            </div>
          </div>

          {/* BOTÓN DE CANCELAR (Solo mostramos si NO está cancelado ya) */}
          {!estaCancelado ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Gestionar Suscripción</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Puedes cancelar la renovación en cualquier momento.</p>
              
              <button 
                onClick={handleCancel}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                Detener Renovación Automática
              </button>
            </div>
          ) : (
            <div className="pt-2 text-center bg-green-50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
              <p className="text-xs text-green-700 dark:text-green-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Renovación cancelada exitosamente.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- COMPONENTE 3: CAMBIO DE CONTRASEÑA ---
export function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setLoading(true); setError(''); setMsg('');
    
    const res = await actualizarPassword(formData)
    setLoading(false)
    
    if (res?.error) setError(res.error)
    if (res?.success) {
      setMsg(res.success)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nueva Contraseña</label>
        <input 
          type="password" 
          name="password" 
          required 
          minLength={6}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Confirmar Contraseña</label>
        <input 
          type="password" 
          name="confirm_password" 
          required 
          minLength={6}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
        />
      </div>
      
      <button 
        disabled={loading} 
        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
        Actualizar Clave
      </button>

      {msg && <p className="text-green-500 text-sm flex items-center gap-1 animate-in fade-in"><CheckCircle size={14} /> {msg}</p>}
      {error && <p className="text-red-500 text-sm flex items-center gap-1 animate-in fade-in"><AlertTriangle size={14} /> {error}</p>}
    </form>
  )
}