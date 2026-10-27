'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from './CheckoutForm'
import { CartSummary } from './CartSummary'
import { motion } from 'framer-motion'
import Link from 'next/link'

export type CheckoutStep = 'customer' | 'payment' | 'success' | 'error'

export function CheckoutPageClient() {
  const items = useCartStore((s) => s.items)
  const [step, setStep] = useState<CheckoutStep>('customer')
  const [orderRef, setOrderRef] = useState('')

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center px-8 pt-24 pb-24 lg:px-16">
        <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">Carrito vacío</p>
        <h1 className="mt-3 font-display text-display-md font-normal text-white">
          No hay productos<br />seleccionados.
        </h1>
        <p className="mt-6 font-body text-sm text-white/50">
          Agrega colchones desde el catálogo para continuar.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 border border-white px-6 py-3.5 font-body text-xs uppercase tracking-widest text-white transition-all hover:bg-white hover:text-[#0A1B54]"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center px-8 pt-24 pb-24 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 h-px w-16 bg-[#C5A059]" />
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Pago aprobado exitosamente
          </p>
          <h1 className="mt-3 font-display text-display-md font-normal text-white">
            Gracias por<br />tu compra.
          </h1>
          <p className="mt-6 font-body text-sm text-white/60 max-w-md leading-relaxed">
            Tu pedido ha sido registrado con la referencia{' '}
            <span className="font-mono text-[#C5A059] font-bold">{orderRef}</span>.
            Hemos notificado a la fábrica y recibirás la confirmación de despacho.
          </p>
          <p className="mt-4 font-body text-xs text-white/40">
            Recuerda que el envío se liquidará de forma separada antes de la entrega.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex border border-white/40 px-6 py-3.5 font-body text-xs uppercase tracking-widest text-white/60 transition-all hover:border-white hover:text-white"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center px-8 pt-24 pb-24 lg:px-16">
        <p className="font-body text-2xs uppercase tracking-[0.2em] text-red-400">Error de transacción</p>
        <h1 className="mt-3 font-display text-display-md font-normal text-white">
          El pago no pudo<br />procesarse.
        </h1>
        <p className="mt-6 font-body text-sm text-white/60 max-w-md">
          Verifica los datos de tu tarjeta o contacta a tu entidad bancaria.
          Ningún cargo erróneo ha sido aplicado.
        </p>
        <button
          onClick={() => setStep('payment')}
          className="mt-8 border border-white px-6 py-3.5 font-body text-xs uppercase tracking-widest text-white transition-all hover:bg-white hover:text-[#0A1B54]"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_420px]">
        {/* Form */}
        <div className="border-b border-white/10 px-8 py-12 lg:border-b-0 lg:border-r lg:px-16">
          <CheckoutForm
            step={step}
            onStepChange={setStep}
            onSuccess={(ref) => {
              setOrderRef(ref)
              setStep('success')
            }}
            onError={() => setStep('error')}
          />
        </div>

        {/* Summary */}
        <div className="px-8 py-12 lg:px-10">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
