'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

export function AuthModal() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const { login: storeLogin } = useAuthStore()
  const { syncFromServer: syncCart } = useCartStore()

  const close = useCallback(() => {
    setOpen(false)
    setError('')
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    previousActiveRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = () => {
      previousActiveRef.current = document.activeElement as HTMLElement
      setOpen(true)
    }
    window.addEventListener('openAuth', handler)
    return () => window.removeEventListener('openAuth', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    setTimeout(() => firstInputRef.current?.focus(), 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let data: any;
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('Las contraseñas no coinciden')
          setLoading(false)
          return
        }
        data = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
        toast.success(`¡Bienvenido, ${data.name}! Cuenta creada con éxito.`)
      } else {
        data = await api.post('/auth/login', { email: form.email, password: form.password })
        toast.success(`Bienvenido de nuevo, ${data.name}.`)
      }

      storeLogin(data)
      await syncCart()
      close()
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud')
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
    >
      <div
        ref={modalRef}
        className="bg-zinc-900 w-full max-w-[400px] p-10 relative animate-in slide-in-from-bottom-4 duration-300 border border-gold-400/20 shadow-2xl"
      >
        <button
          onClick={close}
          className="absolute top-3 right-4 text-zinc-400 hover:text-primary transition-colors"
        >
          <X className="size-6" />
        </button>

        <h2 className="font-heading text-2xl font-semibold text-center text-white tracking-wide mb-1">
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        <div className="w-10 h-px bg-gold-400 mx-auto mt-3 mb-8" />

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 text-sm p-3 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Nombre Completo</label>
              <Input
                id="reg-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-zinc-800 text-white border-zinc-700 focus:border-gold-400"
                ref={mode === 'register' ? firstInputRef : undefined}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Correo Electrónico</label>
            <Input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-zinc-800 text-white border-zinc-700 focus:border-gold-400"
              ref={mode === 'login' ? firstInputRef : undefined}
            />
          </div>
          <div className="relative space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Contraseña</label>
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="bg-zinc-800 text-white border-zinc-700 focus:border-gold-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-zinc-400 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {mode === 'register' && (
            <div className="relative space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Confirmar Contraseña</label>
              <Input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={// @ts-ignore
                form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.// @ts-ignore
                target.value })}
                required
                minLength={6}
                className="bg-zinc-800 text-white border-zinc-700 focus:border-gold-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[34px] text-zinc-400 hover:text-primary transition-colors"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
          <Button type="submit" className="w-full bg-gold-400 text-ebony hover:bg-gold-500" size="lg" loading={loading}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
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
