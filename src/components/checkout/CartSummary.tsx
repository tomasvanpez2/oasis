'use client'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { getShippingZoneById, getDefaultShippingZone } from '@/lib/shipping'
import { SecurityBadges } from './SecurityBadges'

interface CartSummaryProps {
  selectedZoneId?: string
}

export function CartSummary({ selectedZoneId }: CartSummaryProps) {
  const { items, getTotalPrice } = useCartStore()

  const shippingZone =
    getShippingZoneById(selectedZoneId || 'bogota-centro-occidente') || getDefaultShippingZone()
  const shippingFee = shippingZone.price
  const subtotal = getTotalPrice()
  const total = subtotal + shippingFee

  return (
    <div className="sticky top-24">
      <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
        Tu pedido
      </p>
      <h2 className="mt-2 font-display text-2xl font-normal text-white">
        Resumen de Compra
      </h2>

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

      <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-white/50">Subtotal Productos</p>
          <p className="font-body text-sm text-white">{formatCOP(subtotal)}</p>
        </div>

        {/* Dynamic Coordinadora Freight */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-body text-xs text-white/50">
              Flete Coordinadora Mercantil
            </p>
            <p className="font-body text-[11px] text-[#C5A059] mt-0.5">
              {shippingZone.name} ({shippingZone.estimatedDays})
            </p>
          </div>
          <p className="font-body text-sm text-[#C5A059] font-medium">
            {formatCOP(shippingFee)}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="font-body text-sm text-white font-medium">Total a pagar en Wompi</p>
            <p className="font-body text-2xs text-white/40">Incluye IVA y transporte asegurado</p>
          </div>
          <p className="font-display text-2xl text-white font-normal">{formatCOP(total)}</p>
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
          Bodega Central: Normandía, Bogotá D.C. Guía y monitoreo activo en tiempo real con Coordinadora.
        </p>
      </div>

      {/* Security badges */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <SecurityBadges />
      </div>
    </div>
  )
}
