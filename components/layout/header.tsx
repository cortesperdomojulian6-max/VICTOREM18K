'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LogOut, Package, MapPin, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/personalizacion', label: 'Personaliza' },
  { href: '/historia', label: 'Historia' },
  { href: '/contacto', label: 'Contacto' },
] as const

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout, refresh } = useAuthStore()
  const { cartCount, syncFromServer } = useCartStore()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (isAuthenticated) {
      syncFromServer()
    }
  }, [isAuthenticated, syncFromServer])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(savedTheme as 'light' | 'dark')
    if (savedTheme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    if (!confirm('¿Estás seguro de cerrar sesión?')) return
    await logout()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-ebony border-b border-gold-400/15">
      <div className="container-main flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <img src="/assets/images/logo.png" alt="Victorem" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'relative px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.06em] transition-colors duration-300',
                'after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gold-400 after:scale-x-0 after:transition-transform after:duration-300',
                'hover:text-gold-400 hover:after:scale-x-100',
                isActive(item.href) && 'text-gold-400 after:scale-x-100',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center size-10 text-white/80 hover:text-gold-400 dark:text-iron-300 dark:hover:text-gold-400 transition-colors rounded-full hover:bg-gold-400/10"
            aria-label="Alternar modo oscuro"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          
          <Link
            href="/carrito"
            className="relative flex items-center justify-center size-10 text-white/80 hover:text-gold-400 dark:text-iron-300 dark:hover:text-gold-400 transition-colors rounded-full hover:bg-gold-400/10"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gold-400 text-ebony text-[0.625rem] font-bold px-1"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="relative group hidden md:block">
              <button
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm text-white/80 hover:bg-white/10 transition-colors"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="size-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate text-xs font-medium">{user.name}</span>
              </button>
              <div className="absolute right-0 top-full pt-2.5 hidden group-hover:block hover:block">
                <div className="bg-white min-w-[220px] shadow-xl border border-black/6 p-2 space-y-0.5">
                  <div className="px-3 py-2.5 flex items-center gap-3 border-b border-pearl/50 mb-1">
                    <span className="size-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-lg flex items-center justify-center shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ebony truncate">{user.name}</p>
                      <p className="text-xs text-stone truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/miperfil" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-iron hover:bg-gold-400/5 hover:text-gold-400 transition-colors rounded-none">
                    <User className="size-4" /> Mi Perfil
                  </Link>
                  <Link href="/miperfil?tab=orders" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-iron hover:bg-gold-400/5 hover:text-gold-400 transition-colors rounded-none">
                    <Package className="size-4" /> Mis Pedidos
                  </Link>
                  <Link href="/miperfil?tab=addresses" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-iron hover:bg-gold-400/5 hover:text-gold-400 transition-colors rounded-none">
                    <MapPin className="size-4" /> Direcciones
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-iron hover:bg-gold-400/5 hover:text-gold-400 transition-colors rounded-none">
                      <Package className="size-4" /> Panel Admin
                    </Link>
                  )}
                  <hr className="border-pearl/50 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-none"
                  >
                    <LogOut className="size-4" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                const event = new CustomEvent('openAuth')
                window.dispatchEvent(event)
              }}
              className="hidden md:inline-flex px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] bg-gold-400 text-ebony hover:bg-gold-500 transition-colors"
            >
              Iniciar Sesión
            </button>
          )}

          <button
            className="md:hidden flex items-center justify-center size-10 text-white/80 hover:text-gold-400 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="md:hidden border-t border-white/5 bg-ebony/95 backdrop-blur-md" aria-label="Navegación móvil">
          <div className="container-main py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'block px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors',
                  isActive(item.href)
                    ? 'text-gold-400 bg-white/5'
                    : 'text-white/70 hover:text-gold-400 hover:bg-white/5',
                )}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('openAuth')) }}
                className="w-full mt-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider bg-gold-400 text-ebony hover:bg-gold-500 transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
