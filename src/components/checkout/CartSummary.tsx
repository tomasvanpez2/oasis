'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { getShippingZoneById, getDefaultShippingZone } from '@/lib/shipping'
import { SecurityBadges } from './SecurityBadges'

interface CartSummaryProps {
  selectedZoneId?: string
}

export function CartSummary({ selectedZoneId }: CartSummaryProps) {
  const {
    items,
    getTotalPrice,
    shipping,
    shippingZone,
    shippingCity,
    shippingLocalidad,
    shippingResolution,
  } = useCartStore()

  // Priorizar la zona resuelta dinámicamente en el store reactivo; fallback al prop si existe
  const defaultZone = getDefaultShippingZone()
  const activeZone =
    shippingZone ||
    (selectedZoneId ? getShippingZoneById(selectedZoneId) : undefined) ||
    defaultZone

  const effectiveShippingFee = typeof shipping === 'number' ? shipping : activeZone.price
  const subtotal = getTotalPrice()
  const isCovered = shippingResolution ? shippingResolution.isCovered : false
  const total = isCovered ? subtotal + effectiveShippingFee : subtotal

  return (
    <div className="sticky top-24 text-[#0A1B54]">
      <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
        Tu pedido
      </p>
      <h2 className="mt-2 font-display text-2xl font-normal text-[#0A1B54]">
        Resumen de Compra
      </h2>

      {/* Lista de productos en orden */}
      <ul className="mt-8 space-y-5 border-t border-[#0A1B54]/10 pt-6">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size}`}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-display text-base font-normal text-[#0A1B54]">
                {item.productName}
              </p>
              <p className="mt-0.5 font-body text-xs text-[#0A1B54]/50">
                {item.size} — {item.dimensions} × {item.quantity}
              </p>
            </div>
            <p className="font-body text-sm font-medium text-[#0A1B54]">
              {formatCOP(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      {/* Desglose financiero y Flete Transporte Propio Quiet Luxury */}
      <div className="mt-6 space-y-4 border-t border-[#0A1B54]/10 pt-6">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-[#0A1B54]/60">Subtotal Productos</p>
          <p className="font-body text-sm font-medium text-[#0A1B54]">{formatCOP(subtotal)}</p>
        </div>

        {/* Flete Transporte Propio en formato texto elegante de solo lectura con transiciones Framer Motion */}
        <div className="rounded border border-[#0A1B54]/15 bg-[#FAF9F7] p-4 transition-all duration-300 hover:border-[#C5A059]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-body text-2xs uppercase tracking-[0.16em] text-[#0A1B54] font-semibold">
                  Logística Transporte Propio
                </span>
                {isCovered && (
                  <span className="inline-flex items-center rounded-full bg-[#C5A059]/15 px-2 py-0.5 font-mono text-[10px] text-[#0A1B54] border border-[#C5A059]/40 font-medium">
                    Tarifa Oficial Confirmada
                  </span>
                )}
              </div>

              {/* Texto elegante de solo lectura con animación fluida al seleccionar ciudad y localidad */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeZone.id}-${effectiveShippingFee}-${isCovered}-${shippingCity}-${shippingLocalidad}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-1.5"
                >
                  {isCovered ? (
                    <div>
                      <p className="font-display text-base text-[#0A1B54] tracking-wide">
                        Flete Transporte Propio ({activeZone.name}) — {formatCOP(effectiveShippingFee)} COP
                      </p>
                      <p className="mt-1 font-body text-[11px] text-[#0A1B54]/60">
                        Entrega coordinada por mensaje • Origen: Bodega Normandía, Bogotá D.C.
                      </p>
                      {shippingCity && (
                        <p className="mt-1 font-body text-[11px] text-[#0A1B54] italic">
                          Destino liquidado:{' '}
                          <strong className="not-italic text-[#0A1B54] font-semibold">
                            {shippingCity}
                            {shippingLocalidad ? ` — ${shippingLocalidad}` : ''}
                          </strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-display text-sm text-[#0A1B54]/70">
                        {shippingCity === 'Bogotá' && !shippingLocalidad
                          ? 'Selecciona una localidad en Bogotá'
                          : 'Selecciona tu ciudad de entrega en el formulario'}
                      </p>
                      <p className="mt-0.5 font-body text-[11px] text-[#0A1B54]/50">
                        Transporte Propio opera exclusivamente en Cota, Chía, Cajicá y Bogotá D.C.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Precio animado en la esquina superior derecha */}
            <div className="text-right">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`fee-${effectiveShippingFee}-${isCovered}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="font-body text-sm font-semibold text-[#C5A059]"
                >
                  {isCovered ? formatCOP(effectiveShippingFee) : '—'}
                </motion.p>
              </AnimatePresence>
              <span className="font-mono text-[10px] text-[#0A1B54]/40 uppercase tracking-widest block mt-0.5">
                Flota Directa
              </span>
            </div>
          </div>
        </div>

        {/* Total a pagar en Wompi */}
        <div className="flex items-center justify-between border-t border-[#0A1B54]/10 pt-4">
          <div>
            <p className="font-body text-sm text-[#0A1B54] font-semibold">Total a pagar en Wompi</p>
            <p className="font-body text-2xs text-[#0A1B54]/50">
              {isCovered
                ? 'Incluye IVA y flete de Transporte Propio liquidado'
                : 'Pendiente seleccionar destino de entrega'}
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`grand-total-${total}-${isCovered}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="font-display text-2xl text-[#0A1B54] font-semibold"
            >
              {formatCOP(total)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Logistics Origin Notice */}
      <div className="mt-6 border border-[#0A1B54]/15 bg-[#FAF9F7] p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
          <p className="font-body text-[11px] uppercase tracking-wider text-[#0A1B54] font-semibold">
            Despacho Directo desde Fábrica
          </p>
        </div>
        <p className="mt-1 font-body text-2xs text-[#0A1B54]/70 leading-relaxed">
          Bodega Central: Normandía, Bogotá D.C. Monitoreo y entrega directa con Transporte Propio. Tarifa blindada ante alteraciones.
        </p>
      </div>

      {/* Security badges */}
      <div className="mt-8 border-t border-[#0A1B54]/10 pt-6">
        <SecurityBadges />
      </div>
    </div>
  )
}
