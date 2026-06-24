'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LogOut, Package, MapPin, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { useTheme } from '@/components/layout/theme-provider'

const NAV_ITEMS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/personalizacion', label: 'Personaliza' },
  { href: '/insumos', label: 'Insumos' },
  { href: '/historia', label: 'Historia' },
  { href: '/contacto', label: 'Contacto' },
] as const

function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) * strength
    const y = (e.clientY - top - height / 2) * strength
    setPosition({ x, y })
  }

  const handleLeave = () => setPosition({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout, refresh } = useAuthStore()
  const { cartCount, syncFromServer } = useCartStore()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

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
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        )}
      >
        <div className="container-main flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 relative z-10">
            <Image src="/assets/images/logo.png" alt="Victorem" width={32} height={32} className="h-8 md:h-9 w-auto" priority />
            <span className="font-heading text-lg md:text-xl font-semibold text-white tracking-wide hidden sm:inline">Victorem</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <Magnetic key={item.href} strength={0.25}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'relative px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.06em] transition-colors duration-300',
                    'after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gold-400 after:scale-x-0 after:transition-transform after:duration-300 after:origin-center',
                    'hover:text-gold-400 hover:after:scale-x-100',
                    isActive(item.href) && 'text-gold-400 after:scale-x-100',
                    scrolled ? 'text-white/80' : 'text-white/90'
                  )}
                >
                  {item.label}
                </Link>
              </Magnetic>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Magnetic strength={0.2}>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center size-10 text-white/70 hover:text-gold-400 transition-all duration-300 rounded-full hover:bg-white/5"
                aria-label="Alternar modo oscuro"
              >
                {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </button>
            </Magnetic>

            <Magnetic strength={0.2}>
              <Link
                href="/carrito"
                className="relative flex items-center justify-center size-10 text-white/70 hover:text-gold-400 transition-all duration-300 rounded-full hover:bg-white/5"
                aria-label="Carrito de compras"
              >
                <ShoppingBag className="size-[18px]" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center bg-gold-400 text-ebony text-[0.625rem] font-bold px-1"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Magnetic>

            {user ? (
              <div className="relative group hidden md:block">
                <Magnetic strength={0.2}>
                  <button
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm text-white/70 hover:bg-white/5 transition-all duration-300"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="size-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate text-xs font-medium">{user.name}</span>
                  </button>
                </Magnetic>
                <div className="absolute right-0 top-full pt-2.5 hidden group-hover:block hover:block">
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="bg-black/80 backdrop-blur-xl border border-white/10 min-w-[220px] shadow-2xl p-2 space-y-0.5"
                  >
                    <div className="px-3 py-2.5 flex items-center gap-3 border-b border-white/10 mb-1">
                      <span className="size-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-lg flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/miperfil" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold-400 transition-all duration-200 rounded-none">
                      <User className="size-4" /> Mi Perfil
                    </Link>
                    <Link href="/miperfil?tab=orders" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold-400 transition-all duration-200 rounded-none">
                      <Package className="size-4" /> Mis Pedidos
                    </Link>
                    <Link href="/miperfil?tab=addresses" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold-400 transition-all duration-200 rounded-none">
                      <MapPin className="size-4" /> Direcciones
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-gold-400 transition-all duration-200 rounded-none">
                        <Package className="size-4" /> Panel Admin
                      </Link>
                    )}
                    <hr className="border-white/10 my-1 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200 rounded-none"
                    >
                      <LogOut className="size-4" /> Cerrar Sesión
                    </button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <Magnetic strength={0.2}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}
                  className="hidden md:inline-flex px-5 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] bg-gold-400 text-ebony hover:bg-gold-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                >
                  Iniciar Sesión
                </button>
              </Magnetic>
            )}

            <button
              className={cn(
                "md:hidden flex items-center justify-center size-10 transition-all duration-300 rounded-full",
                open ? "text-gold-400" : "text-white/70 hover:text-gold-400"
              )}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex-1 flex flex-col justify-center items-center gap-2 px-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'block text-center py-3 text-2xl font-heading font-light tracking-widest transition-all duration-300',
                      isActive(item.href)
                        ? 'text-gold-400'
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_ITEMS.length * 0.08 + 0.1, duration: 0.4 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('openAuth')) }}
                    className="px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] bg-gold-400 text-ebony hover:bg-gold-300 transition-all duration-300"
                  >
                    Iniciar Sesión
                  </button>
                </motion.div>
              )}
            </div>
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] uppercase tracking-[0.3em] text-white/20"
              >
                Victorem — Joyas Artesanales
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
