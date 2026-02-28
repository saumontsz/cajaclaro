'use client'

import { useState } from 'react'
import { iniciarPagoWebpay } from './webpay-actions'
import { CreditCard, Loader2 } from 'lucide-react'

export default function BotonWebpay({ plan, ciclo }: { plan: string, ciclo: string }) {
  const [loading, setLoading] = useState(false)

  const handlePago = async () => {
    console.log("🖱️ Botón presionado en el cliente");
    setLoading(true);
    
    try {
      const res = await iniciarPagoWebpay(plan, ciclo);
      console.log("📥 Resultado desde el servidor:", res);

      if (res.success && res.url && res.token) {
        console.log("🛠️ Creando formulario POST...");
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.url;

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = res.token;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Error: " + (res.error || "Respuesta del servidor inválida"));
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error fatal en el cliente:", err);
      alert("Error de conexión. Revisa la consola del navegador.");
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handlePago}
      disabled={loading}
      className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 
        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Conectando...
        </>
      ) : (
        <>
          <CreditCard size={20} />
          Pagar con Webpay Plus
        </>
      )}
    </button>
  )
}