'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { formatCOP } from '@/lib/utils'
import type { CartItem, CustomerInfo } from '@/types'

interface HydratedReceiptOrder {
  id: string
  reference: string
  wompiTransactionId?: string
  status: string
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  shipping: number
  shippingZone?: string
  total: number
  currency: string
  biCategory?: string
  paymentMethod: string
  installments: number
  createdAt: string
}

interface SuccessReceiptProps {
  reference: string
  transactionId?: string
}

export function SuccessReceipt({ reference, transactionId }: SuccessReceiptProps) {
  const [order, setOrder] = useState<HydratedReceiptOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchOrderAndNotify() {
      try {
        setLoading(true)
        const response = await fetch('/api/checkout/notify-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: reference || '',
            transactionId: transactionId || '',
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.order) {
          throw new Error(data.error || 'No fue posible cargar el detalle del recibo de compra.')
        }

        if (isMounted) {
          setOrder(data.order)
          setLoading(false)
        }
      } catch (err) {
        console.error('[SuccessReceipt:error]', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error cargando recibo de pago')
          setLoading(false)
        }
      }
    }

    if (reference || transactionId) {
      fetchOrderAndNotify()
    } else {
      setLoading(false)
      setError('No se proporcionó una referencia válida de compra.')
    }

    return () => {
      isMounted = false
    }
  }, [reference, transactionId])

  function handleCopyReference() {
    if (order?.reference) {
      navigator.clipboard.writeText(order.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-body text-xs uppercase tracking-[0.25em] text-[#C5A059]">
          Generando recibo oficial y notificando a planta...
        </p>
        <p className="mt-2 font-body text-xs text-white/40">
          Verificando transacción en servidores seguros de Bancolombia / Wompi
        </p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[70vh] flex-col items-start justify-center px-6 sm:px-12 lg:px-20 max-w-2xl mx-auto">
        <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
          Verificación de Orden
        </span>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-white">
          Orden #{reference || 'N/A'}
        </h1>
        <div className="mt-6 border border-white/10 bg-[#07133B] p-6 w-full space-y-3">
          <p className="font-body text-sm text-white/80 leading-relaxed">
            Hemos recibido el reporte de pago para tu referencia{' '}
            <span className="font-mono font-bold text-[#C5A059]">{reference}</span>.
          </p>
          <p className="font-body text-xs text-white/50">
            {error || 'El recibo está siendo consolidado en nuestra base de datos industrial.'}
          </p>
          <div className="pt-4 flex gap-4">
            <Link
              href="/"
              className="border border-white/30 px-5 py-2.5 font-body text-xs uppercase tracking-widest text-white hover:bg-white hover:text-[#0A1B54] transition-all"
            >
              Volver al Inicio
            </Link>
            <Link
              href="/catalogo"
              className="border border-[#C5A059] bg-[#C5A059] px-5 py-2.5 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold hover:bg-white hover:border-white transition-all"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const customerName = order.customer?.fullName || 'Estimado Cliente'
  const installmentsFormatted =
    order.installments && order.installments > 1
      ? `${order.installments} cuotas mensuales diferidas`
      : '1 cuota (Pago de contado / Débito directo)'

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── HEADER BANNER ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center sm:text-left border-b border-white/10 pb-8"
      >
        <div className="inline-flex items-center gap-2.5 border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1.5 backdrop-blur-sm mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
            Transacción Confirmada • Despacho Coordinadora Programado
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
          Gracias por tu compra, <span className="text-[#C5A059]">{customerName}</span>.
        </h1>
        <p className="mt-3 font-body text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
          Tu orden ha sido confirmada con éxito y transmitida directamente a nuestro taller industrial de manufactura en{' '}
          <strong className="text-white">Normandía, Bogotá</strong>.
        </p>
      </motion.div>

      {/* ── PREMIUM QUIET LUXURY RECEIPT CARD ──────────────────────────── */}
      <motion.div
        id="print-receipt"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 border border-white/15 bg-gradient-to-b from-[#0D2266]/40 via-[#0A1B54] to-[#07133B] p-6 sm:p-10 shadow-2xl backdrop-blur-md"
      >
        {/* Receipt Top Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <p className="font-display text-xl text-white tracking-wide">
              OASIS COLCHONES
            </p>
            <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] mt-0.5">
              Comprobante Oficial de Compra Directa de Fábrica
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="border border-white/20 bg-white/5 px-3.5 py-2 text-right">
              <span className="block font-body text-[10px] uppercase tracking-wider text-white/40">
                Número de Orden
              </span>
              <span className="font-mono text-sm font-bold text-[#C5A059]">
                {order.reference}
              </span>
            </div>
            <button
              onClick={handleCopyReference}
              type="button"
              className="border border-white/20 p-2 text-white/60 hover:border-white hover:text-white transition-colors"
              title="Copiar referencia"
            >
              {copied ? (
                <span className="font-mono text-xs text-emerald-400">✓</span>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── METADATA TILES (Payment, Installments, Logistics, Customer) ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-white/10 pb-8">
          {/* Tile 1: Payment Method */}
          <div className="space-y-1">
            <span className="font-body text-2xs uppercase tracking-wider text-white/40">
              Método de Pago
            </span>
            <p className="font-body text-sm font-medium text-white flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {order.paymentMethod}
            </p>
            <p className="font-mono text-[11px] text-white/40">
              {order.wompiTransactionId ? `Tx ID: ${order.wompiTransactionId.slice(0, 14)}...` : 'Pasarela Wompi'}
            </p>
          </div>

          {/* Tile 2: Installments (Cuotas) */}
          <div className="space-y-1">
            <span className="font-body text-2xs uppercase tracking-wider text-white/40">
              Número de Cuotas
            </span>
            <p className="font-body text-sm font-semibold text-[#C5A059]">
              {installmentsFormatted}
            </p>
            <p className="font-body text-[11px] text-white/40">
              Sin recargos adicionales
            </p>
          </div>

          {/* Tile 3: Logistics & Zone */}
          <div className="space-y-1">
            <span className="font-body text-2xs uppercase tracking-wider text-white/40">
              Logística Coordinadora
            </span>
            <p className="font-body text-sm font-medium text-white">
              {order.shippingZone || 'Bogotá Urbana'}
            </p>
            <p className="font-body text-[11px] text-white/40">
              Salida: Bodega Normandía, Bogotá
            </p>
          </div>

          {/* Tile 4: Timestamp */}
          <div className="space-y-1">
            <span className="font-body text-2xs uppercase tracking-wider text-white/40">
              Fecha de Confirmación
            </span>
            <p className="font-body text-sm text-white">
              {formattedDate}
            </p>
            <p className="font-body text-[11px] text-emerald-400">
              ✓ Notificado a Taller por Servidor
            </p>
          </div>
        </div>

        {/* ── CLIENT & DELIVERY ADDRESS INFO ─────────────────────────────── */}
        <div className="mt-8 border-b border-white/10 pb-8">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] mb-4">
            Destinatario y Domicilio de Entrega
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-body text-white/80 bg-white/5 p-4 border border-white/10">
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">Titular</span>
              <span className="font-medium text-white">{order.customer.fullName}</span>
              <span className="block text-white/50">{order.customer.documentType} {order.customer.document}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">Contacto</span>
              <span className="text-white">{order.customer.phone}</span>
              <span className="block text-white/50">{order.customer.email}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">Dirección Exacta</span>
              <span className="text-white">{order.customer.address}</span>
              <span className="block text-white/50">{order.customer.city}</span>
              {order.customer.notes && (
                <span className="block text-[#C5A059] italic mt-1 text-[11px]">Nota: {order.customer.notes}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── EXACT PURCHASED PRODUCTS LIST ──────────────────────────────── */}
        <div className="mt-8">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] mb-6">
            Lista Exacta de Productos Comprados ({order.items.length})
          </p>

          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${item.size}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between border border-white/10 bg-[#07133B]/60 p-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden border border-white/15 bg-[#0A1B54]">
                    <Image
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-normal text-white">
                      {item.productName}
                    </h3>
                    <p className="font-body text-xs text-white/60">
                      Medida: <span className="text-[#C5A059]">{item.size}</span> ({item.dimensions})
                    </p>
                    <p className="font-mono text-2xs text-white/40 mt-0.5">
                      Cant: {item.quantity} × {formatCOP(item.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                  <span className="block font-body text-[10px] uppercase tracking-wider text-white/40">
                    Subtotal Línea
                  </span>
                  <span className="font-display text-lg text-white font-normal">
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINANCIAL SETTLEMENT ───────────────────────────────────────── */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="max-w-xs ml-auto space-y-2.5">
            <div className="flex justify-between text-xs font-body text-white/60">
              <span>Subtotal Productos:</span>
              <span className="text-white">{formatCOP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-body text-white/60">
              <span>Flete Coordinadora ({order.shippingZone || 'Zona seleccionada'}):</span>
              <span className="text-[#C5A059] font-medium">{formatCOP(order.shipping)}</span>
            </div>
            <div className="border-t border-white/15 pt-3 flex justify-between items-baseline">
              <span className="font-body text-sm uppercase tracking-wider text-white font-semibold">
                Total Pagado:
              </span>
              <span className="font-display text-2xl text-[#C5A059] font-normal">
                {formatCOP(order.total)} <span className="text-xs font-mono text-white/50">COP</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── SECURITY AUDIT & DIRECT FACTORY WARRANTY ────────────────────── */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-2xs font-body text-white/40 gap-4">
          <p>
            🛡️ Certificado de Garantía Industrial de Fábrica: 10 a 15 Años. Fabricado en Bogotá D.C.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 border border-white/30 px-4 py-2 text-white hover:border-white hover:text-[#C5A059] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimir Recibo
            </button>
            <Link
              href="/"
              className="border border-[#C5A059] bg-[#C5A059] px-4 py-2 font-body text-2xs uppercase tracking-widest text-[#0A1B54] font-semibold hover:bg-white hover:border-white transition-all"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

