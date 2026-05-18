import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './useAuthStore'

interface CartItem {
  id: number
  product_id: number
  name: string
  price: string | number
  cantidad: number
  image_url: string
}

interface CartState {
  items: CartItem[]
  cartCount: number
  total: number
  isLoading: boolean
  addItem: (productId: number, quantity?: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  syncFromServer: () => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartCount: 0,
  total: 0,
  isLoading: false,

  syncFromServer: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return set({ items: [], cartCount: 0, total: 0 })

    set({ isLoading: true })
    try {
      const data = await api.get<{items: CartItem[], total: number}>('/cart')
      const items = data.items || []
      const cartCount = items.reduce((acc, item) => acc + item.cantidad, 0)
      set({ items, cartCount, total: data.total || 0, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    try {
      await api.post('/cart/items', { product_id: productId, quantity })
      await get().syncFromServer()
    } catch (error) {
      console.error(error)
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`)
      await get().syncFromServer()
    } catch (error) {
      console.error(error)
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      await api.put(`/cart/items/${itemId}`, { quantity })
      await get().syncFromServer()
    } catch (error) {
      console.error(error)
    }
  },

  clearCart: () => set({ items: [], cartCount: 0 })
}))
