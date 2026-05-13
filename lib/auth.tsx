'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import type { User } from '@/types'
import { api } from './api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const data = await api.get<User>('/users/profile')
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('authChange', handler)
    return () => window.removeEventListener('authChange', handler)
  }, [refresh])

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new CustomEvent('authChange'))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
