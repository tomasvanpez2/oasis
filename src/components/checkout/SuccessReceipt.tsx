'use client'
import React, { useEffect, useState, useCallback } from 'react'
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

type VerificationStatus =
  | 'IDLE'
  | 'LOADING'
  | 'APPROVED'
  | 'AUTH_ERROR'
  | 'DECLINED'
  | 'PENDING'
  | 'VOIDED'
  | 'ERROR'
  | 'MISSING_TRANSACTION_ID'
  | 'REFERENCE_MISMATCH'
  | 'GATEWAY_ERROR'

export function SuccessReceipt({ reference, transactionId }: SuccessReceiptProps) {
  const [order, setOrder] = useState<HydratedReceiptOrder | null>(null)
  const [status, setStatus] = useState<VerificationStatus>('LOADING')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const verifyPayment = useCallback(async () => {
    setStatus('LOADING')
    setErrorMessage(null)

    // Fail Closed: If no transactionId was passed, do not attempt to validate or fake approval
    if (!transactionId) {
      setStatus('MISSING_TRANSACTION_ID')
      setErrorMessage(
        'No se detectó un identificador de transacción oficial emitido por Wompi. Por políticas de seguridad Zero Trust, los recibos oficiales solo se generan tras validación criptográfica directa.'
      )
      return
    }

    try {
      const response = await fetch('/api/checkout/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference || '',
          transactionId: transactionId || '',
        }),
      })

      const data = await response.json()

      // Handle Fail-Closed error statuses from backend
      if (!response.ok || !data.success) {
        const receivedStatus: string = data.status || 'ERROR'

        if (response.status === 401 || receivedStatus === 'AUTH_ERROR') {
          setStatus('AUTH_ERROR')
          setErrorMessage(
            data.error ||
              'Fallo Auth Wompi: Verifica Entorno Sandbox/Prod. Por seguridad Zero Trust, esta orden no ha sido aprobada.'
          )
          return
        }

        if (receivedStatus === 'DECLINED') {
          setStatus('DECLINED')
          setErrorMessage(
            data.error || 'La transacción fue declinada por la entidad financiera o pasarela de pagos.'
          )
          return
        }

        if (receivedStatus === 'PENDING') {
          setStatus('PENDING')
          setErrorMessage(
            data.error ||
              'La transacción se encuentra en proceso de validación bancaria. Los fondos aún no han sido confirmados por Wompi.'
          )
          return
        }

        if (receivedStatus === 'VOIDED' || receivedStatus === 'ERROR') {
          setStatus('ERROR')
          setErrorMessage(
            data.error || 'La transacción fue anulada o presentó un error en el procesamiento bancario.'
          )
          return
        }

        if (receivedStatus === 'REFERENCE_MISMATCH') {
          setStatus('REFERENCE_MISMATCH')
          setErrorMessage(data.error || 'Conflicto de integridad: La referencia no coincide con la transacción de Wompi.')
          return
        }

        if (receivedStatus === 'GATEWAY_ERROR' || response.status === 502) {
          setStatus('GATEWAY_ERROR')
          setErrorMessage(
            data.error || 'Error de comunicación con los servidores seguros de Wompi Bancolombia.'
          )
          return
        }

        setStatus('ERROR')
        setErrorMessage(data.error || 'No fue posible validar la transacción.')
        return
      }

      // ONLY APPROVED TRANSACTIONS WITH HYDRATED ORDER DATA REACH HERE
      if (data.status === 'APPROVED' && data.order) {
        setOrder(data.order)
        setStatus('APPROVED')
      } else {
        setStatus('ERROR')
        setErrorMessage('Respuesta de confirmación incompleta o no autorizada.')
      }
    } catch (err) {
      console.error('[SuccessReceipt:networkError]', err)
      setStatus('GATEWAY_ERROR')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Error de red al consultar el estado de la transacción con el servidor.'
      )
    }
  }, [reference, transactionId])

  useEffect(() => {
    verifyPayment()
  }, [verifyPayment, retryCount])

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

  function handleRetry() {
    setRetryCount((prev) => prev + 1)
  }

  // ── 1. LOADING STATE ────────────────────────────────────────────────────────
  if (status === 'LOADING') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <div className="h-9 w-9 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-5" />
        <p className="font-body text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium text-center">
          Validando transacción con servidores seguros de Wompi...
        </p>
        <p className="mt-2 font-body text-xs text-white/50 text-center max-w-md">
          Consultando estado criptográfico bancario en tiempo real. Por seguridad Zero Trust, el recibo se emite únicamente con confirmación directa.
        </p>
      </div>
    )
  }

  // ── 2. FAIL-CLOSED NON-APPROVED STATES (Zero Trust) ─────────────────────────
  if (status !== 'APPROVED' || !order) {
    let badgeText = '⚠️ Validación Pendiente'
    let badgeStyle = 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    let titleText = 'Validación de Pago'
    let isDeclined = false
    let isPending = false
    let isAuthError = false

    if (status === 'AUTH_ERROR') {
      badgeText = '⚠️ Error de Autenticación de Pasarela (401)'
      badgeStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      titleText = 'Fallo de Autenticación Wompi'
      isAuthError = true
    } else if (status === 'DECLINED') {
      badgeText = '❌ Transacción Declinada por el Banco'
      badgeStyle = 'border-red-500/40 bg-red-500/10 text-red-300'
      titleText = 'Pago No Aprobado'
      isDeclined = true
    } else if (status === 'PENDING') {
      badgeText = '⏳ Transacción en Proceso Bancario'
      badgeStyle = 'border-amber-400/40 bg-amber-400/10 text-amber-200'
      titleText = 'Pago Pendiente de Confirmación'
      isPending = true
    } else if (status === 'MISSING_TRANSACTION_ID') {
      badgeText = '🔒 Verificación Requerida'
      badgeStyle = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
      titleText = 'Comprobante de Pago No Encontrado'
    } else if (status === 'REFERENCE_MISMATCH') {
      badgeText = '🛡️ Discrepancia de Referencia'
      badgeStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      titleText = 'Fallo de Integridad en Transacción'
    }

    return (
      <div className="flex min-h-[70vh] flex-col items-start justify-center px-6 sm:px-12 lg:px-20 max-w-3xl mx-auto py-12">
        <div className={`inline-flex items-center gap-2 border px-3.5 py-1.5 backdrop-blur-sm text-2xs uppercase tracking-widest font-mono ${badgeStyle}`}>
          <span>{badgeText}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-normal text-white">
          {titleText}
        </h1>

        <div className="mt-6 border border-white/10 bg-[#07133B] p-6 sm:p-8 w-full space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">
                Referencia de Orden
              </span>
              <span className="font-mono text-base font-bold text-[#C5A059]">
                {reference || 'No especificada'}
              </span>
            </div>
            {transactionId && (
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">
                  ID Transacción Wompi
                </span>
                <span className="font-mono text-xs text-white/70">
                  {transactionId}
                </span>
              </div>
            )}
          </div>

          <p className="font-body text-sm text-white/90 leading-relaxed">
            {errorMessage ||
              'La transacción no ha recibido el estado de aprobación por parte de la pasarela de pagos Wompi.'}
          </p>

          {isAuthError && (
            <div className="border border-rose-500/30 bg-rose-950/20 p-4 text-xs font-mono text-rose-200/90 space-y-1">
              <p className="font-bold text-rose-300">
                [Diagnóstico de Seguridad Bancaria]:
              </p>
              <p>
                Fallo Auth Wompi: Verifica Entorno Sandbox/Prod. Las credenciales utilizadas no corresponden al endpoint consultado o son inválidas. Por arquitectura Fail-Closed, la orden no ha sido aprobada.
              </p>
            </div>
          )}

          {isDeclined && (
            <p className="font-body text-xs text-white/60">
              No se ha efectuado ningún cobro en tu cuenta o tarjeta de crédito. Puedes intentar el pago nuevamente utilizando otro método de pago (Tarjeta, Nequi, PSE o Botón Bancolombia).
            </p>
          )}

          {isPending && (
            <p className="font-body text-xs text-white/60">
              Si realizaste el pago mediante PSE o transferencia bancaria, el banco emisor puede demorar varios minutos en confirmar la transferencia. Puedes consultar nuevamente en unos instantes.
            </p>
          )}

          <div className="pt-4 flex flex-wrap gap-3">
            {transactionId && (
              <button
                type="button"
                onClick={handleRetry}
                className="border border-[#C5A059] bg-[#C5A059] px-5 py-2.5 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold hover:bg-white hover:border-white transition-all"
              >
                Reintentar Verificación
              </button>
            )}
            {isDeclined && (
              <Link
                href="/checkout"
                className="border border-[#C5A059] bg-[#C5A059] px-5 py-2.5 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold hover:bg-white hover:border-white transition-all"
              >
                Reintentar Pago
              </Link>
            )}
            <Link
              href="/catalogo"
              className="border border-white/20 px-5 py-2.5 font-body text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/"
              className="border border-white/10 px-5 py-2.5 font-body text-xs uppercase tracking-widest text-white/70 hover:text-white transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. APPROVED STATE: ZERO TRUST QUIET LUXURY RECEIPT ─────────────────────
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
            Transacción Confirmada • Despacho con Transporte Propio Programado
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
          Gracias por tu compra, <span className="text-[#C5A059]">{customerName}</span>.
        </h1>
        <p className="mt-3 font-body text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
          Tu orden ha sido confirmada con éxito mediante validación bancaria directa de Wompi y transmitida a nuestro taller industrial en{' '}
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
              Comprobante Oficial de Compra
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

        {/* ── METADATA TILES (Payment, Installments, Logistics, Timestamp) ── */}
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
              {order.wompiTransactionId ? `Tx ID: ${order.wompiTransactionId.slice(0, 14)}...` : 'Validado en Wompi'}
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
              Logística Transporte Propio
            </span>
            <p className="font-body text-sm font-medium text-white">
              {order.shippingZone || 'Transporte Propio'}
            </p>
            <p className="font-body text-[11px] text-white/40">
              Entrega coordinada por mensaje • Salida: Bodega Normandía
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
              <span className="block text-white/50">
                {order.customer.city}
                {order.customer.localidad ? ` — ${order.customer.localidad}` : ''}
              </span>
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
                      sizes="80px"
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
              <span>Flete Transporte Propio ({order.shippingZone || 'Zona seleccionada'}):</span>
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
            🛡️ Certificado de Garantía Oficial. Fabricado en Bogotá D.C.
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
