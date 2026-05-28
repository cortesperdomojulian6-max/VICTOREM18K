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

interface LocalItem {
  localId: string
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartState {
  items: CartItem[]
  localItems: LocalItem[]
  cartCount: number
  total: number
  isLoading: boolean
  addItem: (productId: number, quantity?: number, productInfo?: { name: string; price: number; imageUrl: string }) => Promise<void>
  removeItem: (itemId: string | number) => Promise<void>
  updateQuantity: (itemId: string | number, quantity: number) => Promise<void>
  syncFromServer: () => Promise<void>
  clearCart: () => void
  mergeLocalCart: () => Promise<void>
}

const LOCAL_KEY = 'victorem-local-cart'

function loadLocalCart(): LocalItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalCart(items: LocalItem[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)) } catch {}
}

const initialLocalItems = typeof window !== 'undefined' ? loadLocalCart() : []
const initialCartCount = initialLocalItems.reduce((acc, i) => acc + i.quantity, 0)
const initialTotal = initialLocalItems.reduce((acc, i) => acc + i.price * i.quantity, 0)

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  localItems: initialLocalItems,
  cartCount: initialCartCount,
  total: initialTotal,
  isLoading: false,

  syncFromServer: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      const localItems = loadLocalCart()
      const cartCount = localItems.reduce((acc, i) => acc + i.quantity, 0)
      const total = localItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
      set({ localItems, cartCount, total, isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const data = await api.get<{items: CartItem[], total: number}>('/cart')
      const items = data.items || []
      const cartCount = items.reduce((acc, item) => acc + item.cantidad, 0)
      set({ items, cartCount, total: data.total || 0, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addItem: async (productId, quantity = 1, productInfo?) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      if (!productInfo) return
      const localItems = loadLocalCart()
      const existing = localItems.find(i => i.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        localItems.push({
          localId: `local-${productId}-${Date.now()}`,
          productId,
          name: productInfo.name,
          price: productInfo.price,
          quantity,
          imageUrl: productInfo.imageUrl,
        })
      }
      saveLocalCart(localItems)
      const cartCount = localItems.reduce((acc, i) => acc + i.quantity, 0)
      const total = localItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
      set({ localItems, cartCount, total })
      return
    }
    try {
      await api.post('/cart/items', { product_id: productId, quantity })
      await get().syncFromServer()
    } catch (error) {
      console.error(error)
    }
  },

  removeItem: async (itemId) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      let localItems = loadLocalCart()
      localItems = localItems.filter(i => i.localId !== String(itemId))
      saveLocalCart(localItems)
      const cartCount = localItems.reduce((acc, i) => acc + i.quantity, 0)
      const total = localItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
      set({ localItems, cartCount, total })
      return
    }
    try {
      await api.delete(`/cart/items/${itemId}`)
      await get().syncFromServer()
    } catch {
      console.error
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      let localItems = loadLocalCart()
      const item = localItems.find(i => i.localId === String(itemId))
      if (item) item.quantity = quantity
      saveLocalCart(localItems)
      const cartCount = localItems.reduce((acc, i) => acc + i.quantity, 0)
      const total = localItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
      set({ localItems, cartCount, total })
      return
    }
    try {
      await api.put(`/cart/items/${itemId}`, { quantity })
      await get().syncFromServer()
    } catch {
      console.error
    }
  },

  clearCart: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      localStorage.removeItem(LOCAL_KEY)
      set({ items: [], localItems: [], cartCount: 0, total: 0 })
      return
    }
    set({ items: [], cartCount: 0, total: 0 })
  },

  mergeLocalCart: async () => {
    const localItems = loadLocalCart()
    if (localItems.length === 0) return
    for (const item of localItems) {
      try {
        await api.post('/cart/items', { product_id: item.productId, quantity: item.quantity })
      } catch {}
    }
    localStorage.removeItem(LOCAL_KEY)
    await get().syncFromServer()
  },
}))
