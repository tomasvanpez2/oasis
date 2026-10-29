'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeCart])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted) return null

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#0A1B54] border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
              <div>
                <p className="font-body text-2xs uppercase tracking-widest text-white/50">
                  Tu selección de fábrica
                </p>
                <h2 className="font-display text-2xl font-normal text-white">
                  Carrito {totalItems > 0 && `(${totalItems})`}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center text-white/60 transition-colors duration-200 hover:text-[#C5A059]"
                aria-label="Cerrar carrito"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center">
                  <p className="font-body text-sm text-white/50">
                    Tu carrito está vacío.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 font-body text-xs uppercase tracking-widest text-[#C5A059] underline underline-offset-4 hover:text-white transition-colors"
                  >
                    Explorar catálogo de 13 referencias →
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="border-b border-white/10 pb-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-display text-lg font-normal text-white">
                            {item.productName}
                          </p>
                          <p className="mt-0.5 font-body text-2xs text-[#C5A059] uppercase tracking-wider">
                            {item.size} — {item.dimensions}
                          </p>
                          <p className="mt-2 font-display text-base text-white">
                            {formatCOP(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-white/30 transition-colors hover:text-red-400"
                          aria-label={`Eliminar ${item.productName}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/70 transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
                            aria-label="Reducir cantidad"
                          >
                            −
                          </button>
                          <span className="font-mono text-sm text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/70 transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-body text-sm text-white font-medium">
                          {formatCOP(item.price * item.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-8 py-6 space-y-4 bg-[#07133B]/40">
                <div className="flex items-center justify-between">
                  <p className="font-body text-2xs uppercase tracking-widest text-white/50">
                    Subtotal directo de fábrica
                  </p>
                  <p className="font-display text-2xl text-white">
                    {formatCOP(totalPrice)}
                  </p>
                </div>
                <p className="font-body text-2xs text-[#C5A059] leading-relaxed">
                  * Flete Coordinadora Mercantil calculado en checkout según tu zona.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full border border-[#C5A059] bg-[#C5A059] py-4 text-center font-body text-xs uppercase tracking-widest font-semibold text-[#0A1B54] transition-all duration-300 hover:bg-white hover:border-white hover:text-[#0A1B54]"
                >
                  Ir al Pago Seguro
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
