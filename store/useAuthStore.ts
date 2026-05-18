import { create } from 'zustand'
import { api } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  registrationDate?: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  
  refresh: async () => {
    set({ isLoading: true })
    try {
      const user = await api.get<User>('/auth/me')
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
