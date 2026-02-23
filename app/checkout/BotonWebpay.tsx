// app/checkout/BotonWebpay.tsx
'use client'

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { iniciarPagoWebpay } from './webpay-actions';

interface Props {
  plan: string;
  ciclo: string;
  monto: number;
  negocioId: string;
}

export default function BotonWebpay({ plan, ciclo, monto, negocioId }: Props) {
  const [cargando, setCargando] = useState(false);

  const handlePago = async () => {
    setCargando(true);
    try {
      // 1. Pedimos el token y la URL a Transbank
      const { url, token } = await iniciarPagoWebpay(plan, ciclo, monto, negocioId);

      // 2. Creamos un formulario invisible en el navegador y lo enviamos a Webpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = token;

      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error(error);
      setCargando(false);
      alert('Error al conectar con Webpay. Intenta nuevamente.');
    }
  };

  return (
    <button 
      onClick={handlePago}
      disabled={cargando}
      className="w-full py-5 px-6 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white text-lg font-black rounded-2xl transition-all shadow-xl shadow-rose-600/20 flex justify-center items-center gap-3 group active:scale-[0.98]"
    >
      {cargando ? (
        <><Loader2 size={20} className="animate-spin" /> Conectando con Transbank...</>
      ) : (
        <>Pagar con Webpay <CreditCard size={20} className="group-hover:scale-110 transition-transform" /></>
      )}
    </button>
  );
}