/**
 * Oasis Colchones — Global Cart Store
 * Zustand with resilient SSR-safe localStorage persistence
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartState, MattressSize } from '@/types'

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

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

      clearCart: () => set({ items: [] }),

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
    }),
    {
      name: 'oasis-colchones-cart',
      storage: safeStorage,
      // Only persist items array, not ephemeral UI state (isOpen)
      partialize: (state) => ({ items: state.items }),
    }
  )
)
