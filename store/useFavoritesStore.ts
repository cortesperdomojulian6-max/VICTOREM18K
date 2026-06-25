import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './useAuthStore'

const LOCAL_KEY = 'victorem-favorites'

interface FavoriteItem {
  product_id: number
  name: string
  price: number
  image_url: string
  description: string
}

interface FavoritesState {
  ids: number[]
  items: FavoriteItem[]
  isLoading: boolean
  syncFromServer: () => Promise<void>
  toggle: (productId: number, productInfo?: { name: string; price: number; imageUrl: string }) => Promise<void>
  isFavorited: (productId: number) => boolean
}

function loadLocal(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocal(ids: number[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(ids)) } catch {}
}

const initialIds = typeof window !== 'undefined' ? loadLocal() : []

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: initialIds,
  items: [],
  isLoading: false,

  syncFromServer: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      set({ ids: loadLocal(), isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const data = await api.get<{ favorites: FavoriteItem[]; ids: number[] }>('/favorites')
      set({ items: data.favorites || [], ids: data.ids || [], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  toggle: async (productId, productInfo?) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      const ids = loadLocal()
      const idx = ids.indexOf(productId)
      if (idx >= 0) {
        ids.splice(idx, 1)
      } else {
        ids.push(productId)
      }
      saveLocal(ids)
      set({ ids: [...ids] })
      return
    }
    try {
      const data = await api.post<{ favorited: boolean }>(`/favorites/${productId}`)
      if (data.favorited) {
        set(state => ({ ids: [...state.ids, productId] }))
      } else {
        set(state => ({ ids: state.ids.filter(id => id !== productId) }))
      }
    } catch {
      console.error
    }
  },

  isFavorited: (productId) => {
    return get().ids.includes(productId)
  },
}))
