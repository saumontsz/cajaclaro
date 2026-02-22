import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Props {
  titulo: string;
  descripcion: string;
  planRequerido: 'Personal' | 'Negocio';
}

export default function FeatureLock({ titulo, descripcion, planRequerido }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-all group">
      {/* Efecto de desenfoque de fondo */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-transparent to-slate-50/80 dark:to-slate-950/80 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
          <Lock size={20} />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{titulo}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[240px] mb-6 leading-relaxed">
          {descripcion}
        </p>
        
        {/* AQUÍ ESTÁ EL CAMBIO: Ahora es un Link hacia /dashboard/planes */}
        <Link 
          href="/dashboard/planes" 
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Sparkles size={16} /> Mejorar a {planRequerido}
        </Link>
      </div>
    </div>
  )
}