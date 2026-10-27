'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCartStore()

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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#0D2266] border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-white/50">
                  Tu selección
                </p>
                <h2 className="font-display text-2xl font-normal text-white">
                  Carrito {getTotalItems() > 0 && `(${getTotalItems()})`}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center text-white/60 transition-colors duration-200 hover:text-white"
                aria-label="Cerrar carrito"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center">
                  <p className="font-body text-sm text-white/40">
                    Tu carrito está vacío.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 font-body text-sm text-[#C5A059] underline underline-offset-4"
                  >
                    Explorar catálogo →
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
                          <p className="mt-0.5 font-body text-xs text-white/50 uppercase tracking-wider">
                            {item.size} — {item.dimensions}
                          </p>
                          <p className="mt-2 font-body text-sm text-white">
                            {formatCOP(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-white/30 transition-colors hover:text-[#C5A059]"
                          aria-label="Eliminar"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.2"/>
                          </svg>
                        </button>
                      </div>

                      {/* Quantity */}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/60 transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span className="font-body text-sm text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center border border-white/20 text-white/60 transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                        <span className="ml-auto font-body text-sm text-white">
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
              <div className="border-t border-white/10 px-8 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs uppercase tracking-widest text-white/50">
                    Subtotal
                  </p>
                  <p className="font-display text-xl text-white">
                    {formatCOP(getTotalPrice())}
                  </p>
                </div>
                <p className="font-body text-xs text-white/40">
                  Envío liquidado por separado antes de la entrega.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full border border-white py-4 text-center font-body text-sm uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-[#0A1B54]"
                >
                  Ir al pago
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
