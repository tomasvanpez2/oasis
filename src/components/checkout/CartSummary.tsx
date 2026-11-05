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
  const isCovered = shippingResolution ? shippingResolution.isCovered : true
  const total = isCovered ? subtotal + effectiveShippingFee : subtotal

  return (
    <div className="sticky top-24">
      <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
        Tu pedido
      </p>
      <h2 className="mt-2 font-display text-2xl font-normal text-white">
        Resumen de Compra
      </h2>

      {/* Lista de productos en orden */}
      <ul className="mt-8 space-y-5 border-t border-white/10 pt-6">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size}`}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-display text-base font-normal text-white">
                {item.productName}
              </p>
              <p className="mt-0.5 font-body text-xs text-white/40">
                {item.size} — {item.dimensions} × {item.quantity}
              </p>
            </div>
            <p className="font-body text-sm text-white">
              {formatCOP(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      {/* Desglose financiero y Flete Coordinadora Quiet Luxury */}
      <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-white/50">Subtotal Productos</p>
          <p className="font-body text-sm text-white">{formatCOP(subtotal)}</p>
        </div>

        {/* Flete Coordinadora en formato texto elegante de solo lectura con transiciones Framer Motion */}
        <div className="rounded border border-white/10 bg-[#07133B]/40 p-4 transition-all duration-300 hover:border-[#C5A059]/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-body text-2xs uppercase tracking-[0.16em] text-[#C5A059] font-medium">
                  Logística Coordinadora Mercantil
                </span>
                {shippingResolution?.matchedBy === 'specific_city' && (
                  <span className="inline-flex items-center rounded-full bg-[#C5A059]/15 px-2 py-0.5 font-mono text-[10px] text-[#C5A059] border border-[#C5A059]/30">
                    Tarifa Oficial Cruzada
                  </span>
                )}
                {shippingResolution?.matchedBy === 'national_fallback' && (
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70 border border-white/15">
                    Tarifa Nacional
                  </span>
                )}
              </div>

              {/* Texto elegante de solo lectura con animación fluida al escribir la ciudad */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeZone.id}-${effectiveShippingFee}-${isCovered}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-1.5"
                >
                  {isCovered ? (
                    <div>
                      <p className="font-display text-base text-white tracking-wide">
                        Flete Coordinadora ({activeZone.name}) — {formatCOP(effectiveShippingFee)} COP
                      </p>
                      <p className="mt-1 font-body text-[11px] text-white/50">
                        {activeZone.estimatedDays} de tránsito • Origen: Bodega Normandía, Bogotá D.C.
                      </p>
                      {shippingCity ? (
                        <p className="mt-1 font-body text-[11px] text-[#C5A059]/90 italic">
                          Calculado dinámicamente para: <strong className="not-italic text-white capitalize">{shippingCity}</strong>
                        </p>
                      ) : (
                        <p className="mt-1 font-body text-[11px] text-white/40">
                          (Escribe tu ciudad o municipio en el formulario para cruzar la tarifa exacta)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-display text-sm text-red-300">
                        Sin cobertura directa para la ubicación ingresada
                      </p>
                      <p className="mt-0.5 font-body text-[11px] text-red-400/80">
                        Coordinadora despacha exclusivamente dentro del territorio colombiano.
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
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mt-0.5">
                Carga Asegurada
              </span>
            </div>
          </div>
        </div>

        {/* Total a pagar en Wompi */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="font-body text-sm text-white font-medium">Total a pagar en Wompi</p>
            <p className="font-body text-2xs text-white/40">
              {isCovered
                ? 'Incluye IVA y flete oficial de carga liquidado'
                : 'Pendiente validar cobertura de destino'}
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`grand-total-${total}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="font-display text-2xl text-white font-normal"
            >
              {formatCOP(total)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Logistics Origin Notice */}
      <div className="mt-6 border border-white/10 bg-[#07133B]/50 p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
          <p className="font-body text-[11px] uppercase tracking-wider text-[#C5A059] font-semibold">
            Despacho Directo desde Fábrica
          </p>
        </div>
        <p className="mt-1 font-body text-2xs text-white/60 leading-relaxed">
          Bodega Central: Normandía, Bogotá D.C. Guía y monitoreo activo en tiempo real con Coordinadora Mercantil. Tarifa blindada ante alteraciones.
        </p>
      </div>

      {/* Security badges */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <SecurityBadges />
      </div>
    </div>
  )
}
