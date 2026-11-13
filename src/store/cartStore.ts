/**
 * Oasis Colchones — Global Cart Store
 * Zustand with resilient SSR-safe localStorage persistence.
 * Manejo integral y automatizado del flete logístico con Transporte Propio & Coordinadora.
 * Regla de Oro: Flete cobrado al 100% al cliente (Cero subsidios por volumen).
 * Regla de Accesorios: Si el carrito contiene EXCLUSIVAMENTE accesorios, flete inyectado = $0.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartState, MattressSize, ShippingZone, ShippingResolution } from '../types'
import {
  getDefaultShippingZone,
  resolveShippingFromLocation,
  isOnlyAccessories,
} from '../lib/shipping'

// SSR-safe storage fallback
const safeStorage = createJSONStorage(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
})

const initialZone = getDefaultShippingZone()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ── Transporte Propio & Coordinadora Shipping State ─────────────────────────
      shipping: initialZone.price,
      shippingZone: initialZone,
      shippingCity: '',
      shippingLocalidad: '',
      shippingDepartment: '',
      shippingResolution: null,
      isCalculatingShipping: false,

      isOnlyAccessories: () => {
        const currentItems = get().items
        return isOnlyAccessories(currentItems)
      },

      addItem: (newItem: Omit<CartItem, 'quantity'>) => {
        // Validación estricta adversarial: Tipo Libro solo autorizado para Queen y King en resortados
        const sizeLower = newItem.size.toLowerCase()
        if (sizeLower.includes('libro')) {
          const isQueen = sizeLower.includes('queen') || sizeLower.includes('160')
          const isKing = sizeLower.includes('king') || sizeLower.includes('200')
          if (sizeLower.includes('doble') || sizeLower.includes('140') || (!isQueen && !isKing)) {
            console.warn('[CartStore:SecurityGuard] Rechazado intento de añadir Tipo Libro para tamaño no autorizado.')
            return
          }
        }

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId && item.size === newItem.size
          )

          let updatedItems: CartItem[]
          if (existingIndex >= 0) {
            updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            }
          } else {
            updatedItems = [...state.items, { ...newItem, quantity: 1 }]
          }

          // Recalcular flete según naturaleza de los ítems
          const onlyAcc = isOnlyAccessories(updatedItems)
          const effectiveShipping = onlyAcc ? 0 : (state.shippingZone?.price || initialZone.price)

          return {
            items: updatedItems,
            isOpen: true,
            shipping: effectiveShipping,
          }
        })
      },

      removeItem: (productId: string, size: MattressSize) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => !(item.productId === productId && item.size === size)
          )
          const onlyAcc = isOnlyAccessories(updatedItems)
          const effectiveShipping = updatedItems.length === 0
            ? initialZone.price
            : onlyAcc
            ? 0
            : (state.shippingZone?.price || initialZone.price)

          return {
            items: updatedItems,
            shipping: effectiveShipping,
          }
        })
      },

      updateQuantity: (productId: string, size: MattressSize, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          )
          const onlyAcc = isOnlyAccessories(updatedItems)
          const effectiveShipping = onlyAcc ? 0 : (state.shippingZone?.price || initialZone.price)

          return {
            items: updatedItems,
            shipping: effectiveShipping,
          }
        })
      },

      clearCart: () =>
        set({
          items: [],
          shippingCity: '',
          shippingLocalidad: '',
          shippingDepartment: '',
          shippingResolution: null,
          shipping: initialZone.price,
          shippingZone: initialZone,
        }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },

      // ── Freight Automation Methods (Zero Volume Subsidies, 100% Client Charged) ──

      /**
       * Cruza automáticamente la ciudad, localidad y naturaleza de los ítems contra la matriz
       * oficial. Si el carrito contiene exclusivamente accesorios, inyecta $0.
       * Si no, cobra el flete oficial al 100% sin descuentos.
       */
      updateShippingLocation: (city: string, localidadOrDepartment?: string): ShippingResolution => {
        set({ isCalculatingShipping: true })

        const currentItems = get().items
        const resolution = resolveShippingFromLocation(city, localidadOrDepartment, currentItems)

        set({
          shippingCity: city,
          shippingLocalidad: city === 'Bogotá' ? (localidadOrDepartment || '') : '',
          shippingDepartment: '',
          shipping: resolution.zone.price, // 0 si solo accesorios, 100% flete de zona en caso contrario
          shippingZone: resolution.zone,
          shippingResolution: resolution,
          isCalculatingShipping: false,
        })

        return resolution
      },

      setShippingZone: (zone: ShippingZone) => {
        const onlyAcc = isOnlyAccessories(get().items)
        set({
          shippingZone: zone,
          shipping: onlyAcc ? 0 : zone.price,
        })
      },

      getShippingFee: () => {
        const currentItems = get().items
        if (currentItems.length > 0 && isOnlyAccessories(currentItems)) {
          return 0
        }
        // Flete cobrado al 100% sin descuentos ni subsidios por volumen
        return get().shipping
      },

      getGrandTotal: () => {
        return get().getTotalPrice() + get().getShippingFee()
      },
    }),
    {
      name: 'oasis-colchones-cart',
      storage: safeStorage,
      // Only persist items array, not ephemeral UI or in-flight form calculation state
      partialize: (state) => ({ items: state.items }),
    }
  )
)
