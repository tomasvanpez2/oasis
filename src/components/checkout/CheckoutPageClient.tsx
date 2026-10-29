'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from './CheckoutForm'
import { CartSummary } from './CartSummary'
import { SuccessReceipt } from './SuccessReceipt'
import { motion } from 'framer-motion'
import Link from 'next/link'

export type CheckoutStep = 'customer' | 'success' | 'error'

function CheckoutContent() {
  const items = useCartStore((s) => s.items)
  const [step, setStep] = useState<CheckoutStep>('customer')
  const [orderRef, setOrderRef] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [selectedShippingZoneId, setSelectedShippingZoneId] = useState('bogota-centro-occidente')
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    const urlRef = searchParams.get('reference')
    const urlId = searchParams.get('id') || searchParams.get('transactionId')
    if (urlRef || urlId) {
      setOrderRef(urlRef || urlId || '')
      setTransactionId(urlId || '')
      setStep('success')
    }
  }, [searchParams])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/50 font-body text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          <span>Iniciando entorno seguro de compra...</span>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen pt-20 pb-20">
        <SuccessReceipt reference={orderRef} transactionId={transactionId} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center px-8 pt-24 pb-24 lg:px-16">
        <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">Carrito vacío</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-normal text-white">
          No hay productos<br />seleccionados.
        </h1>
        <p className="mt-6 font-body text-sm text-white/60">
          Agrega colchones desde el catálogo para continuar al checkout seguro.
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

  if (step === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center px-8 pt-24 pb-24 lg:px-16">
        <p className="font-body text-2xs uppercase tracking-[0.2em] text-red-400">Error de conexión</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-normal text-white">
          No fue posible<br />iniciar el pago.
        </h1>
        <p className="mt-6 font-body text-sm text-white/60 max-w-md">
          Ocurrió un problema de comunicación con los servicios de pasarela. Tus productos continúan en el carrito y ningún cargo ha sido efectuado.
        </p>
        <button
          onClick={() => setStep('customer')}
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
            selectedZoneId={selectedShippingZoneId}
            onZoneChange={setSelectedShippingZoneId}
            onError={() => setStep('error')}
          />
        </div>

        {/* Summary */}
        <div className="px-8 py-12 lg:px-10">
          <CartSummary selectedZoneId={selectedShippingZoneId} />
        </div>
      </div>
    </div>
  )
}

export function CheckoutPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-white/40 font-body text-sm">
          Cargando checkout seguro...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
