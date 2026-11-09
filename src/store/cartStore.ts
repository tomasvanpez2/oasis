/**
 * Oasis Colchones — Global Cart Store
 * Zustand with resilient SSR-safe localStorage persistence.
 * Manejo integral y automatizado del flete logístico con Transporte Propio.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartState, MattressSize, ShippingZone, ShippingResolution } from '@/types'
import { getDefaultShippingZone, resolveShippingFromLocation } from '@/lib/shipping'

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

      // ── Transporte Propio Automated Shipping State ──────────────────────────────
      shipping: initialZone.price,
      shippingZone: initialZone,
      shippingCity: '',
      shippingLocalidad: '',
      shippingDepartment: '',
      shippingResolution: null,
      isCalculatingShipping: false,

      addItem: (newItem: Omit<CartItem, 'quantity'>) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId && item.size === newItem.size
          )

          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            }
            return { items: updatedItems, isOpen: true }
          }

          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
            isOpen: true,
          }
        })
      },

      removeItem: (productId: string, size: MattressSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        }))
      },

      updateQuantity: (productId: string, size: MattressSize, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }))
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

      // ── Transporte Propio Freight Automation Methods ────────────────────────────

      /**
       * Cruza automáticamente la ciudad y localidad seleccionada contra la matriz
       * de Transporte Propio y actualiza el estado global de envío de forma reactiva.
       */
      updateShippingLocation: (city: string, localidadOrDepartment?: string): ShippingResolution => {
        set({ isCalculatingShipping: true })

        const resolution = resolveShippingFromLocation(city, localidadOrDepartment)

        set({
          shippingCity: city,
          shippingLocalidad: city === 'Bogotá' ? (localidadOrDepartment || '') : '',
          shippingDepartment: '',
          shipping: resolution.zone.price,
          shippingZone: resolution.zone,
          shippingResolution: resolution,
          isCalculatingShipping: false,
        })

        return resolution
      },

      setShippingZone: (zone: ShippingZone) => {
        set({
          shippingZone: zone,
          shipping: zone.price,
        })
      },

      getShippingFee: () => {
        return get().shipping
      },

      getGrandTotal: () => {
        return get().getTotalPrice() + get().shipping
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
