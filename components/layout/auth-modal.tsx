'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export function AuthModal() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openAuth', handler)
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('openAuth', handler)
      window.removeEventListener('keydown', handleEsc)
    }
  }, [close])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
    } else {
      document.body.style.overflow = ''
    }
  }, [open, close])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('Las contraseñas no coinciden')
          setLoading(false)
          return
        }
        await api.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
        })
      }

      const data = await api.post<{ token: string; user: { name: string; email: string } }>(
        '/auth/login',
        { email: form.email, password: form.password },
      )

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('authChange'))
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      close()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
    >
      <div className="bg-white w-full max-w-[400px] p-10 relative animate-in slide-in-from-bottom-4 duration-300 border border-gold-400/20 shadow-2xl">
        <button
          onClick={close}
          className="absolute top-3 right-4 text-silver hover:text-ebony transition-colors"
          aria-label="Cerrar"
        >
          <X className="size-6" />
        </button>

        <h2 className="font-heading text-2xl font-semibold text-center text-ebony tracking-wide mb-1">
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        <div className="w-10 h-px bg-gold-400 mx-auto mt-3 mb-8" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              id="reg-name"
              label="Nombre Completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <Input
            id="auth-email"
            label="Correo Electrónico"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            id="auth-password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          {mode === 'register' && (
            <Input
              id="reg-confirm"
              label="Confirmar Contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          )}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-stone mt-6">
          {mode === 'login' ? (
            <>¿No tienes una cuenta?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-gold-400 font-semibold hover:underline">
                Regístrate aquí
              </button>
            </>
          ) : (
            <>¿Ya tienes una cuenta?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-gold-400 font-semibold hover:underline">
                Inicia sesión aquí
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
