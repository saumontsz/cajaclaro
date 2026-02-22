'use client'

import { useState } from 'react'
import UserTypeSelection from './UserTypeSelection'
import OnboardingForm from './OnboardingForm'

export default function OnboardingFlow() {
  // Estado para controlar el paso: 'tipo' o 'datos'
  const [paso, setPaso] = useState<'tipo' | 'datos'>('tipo')
  const [perfil, setPerfil] = useState<'personal' | 'negocio'>('personal')

  const seleccionarPerfil = (tipo: 'personal' | 'negocio') => {
    setPerfil(tipo)
    setPaso('datos')
  }

  return (
    <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 transition-all">
      {paso === 'tipo' ? (
        <UserTypeSelection onSelect={seleccionarPerfil} />
      ) : (
        <OnboardingForm tipoPerfil={perfil} onBack={() => setPaso('tipo')} />
      )}
    </div>
  )
}