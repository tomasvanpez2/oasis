'use client'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { SecurityBadges } from './SecurityBadges'

export function CartSummary() {
  const { items, getTotalPrice } = useCartStore()

  return (
    <div className="sticky top-24">
      <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
        Tu pedido
      </p>
      <h2 className="mt-2 font-display text-2xl font-normal text-white">
        Resumen
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
          <p className="font-body text-xs text-white/50">Subtotal</p>
          <p className="font-body text-sm text-white">{formatCOP(getTotalPrice())}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-white/50">Envío</p>
          <p className="font-body text-xs text-white/40 italic">A liquidar por separado</p>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <p className="font-body text-sm text-white">Total a pagar hoy</p>
          <p className="font-display text-xl text-white">{formatCOP(getTotalPrice())}</p>
        </div>
      </div>

      {/* Security badges */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <SecurityBadges />
      </div>
    </div>
  )
}
