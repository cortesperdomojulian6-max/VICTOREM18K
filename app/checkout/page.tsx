'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Building2, ShieldCheck, Truck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { CartItem, Address, User } from '@/types'

interface FormState {
  nombre: string
  apellido: string
  direccion: string
  ciudad: string
  departamento: string
  telefono: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    nombre: '', apellido: '', direccion: '', ciudad: '', departamento: '', telefono: '',
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      toast.error('Debes iniciar sesión para continuar')
      return
    }
    setAuthenticated(true)

    const load = async () => {
      try {
        const [userData, cartData] = await Promise.all([
          api.get<User>('/users/profile'),
          api.get<{ items: CartItem[]; total: number }>('/cart'),
        ])
        setUser(userData)
        setCartItems(cartData.items || [])
        setTotal(cartData.total || 0)

        const addresses = await api.get<Address[]>('/addresses')
        if (addresses.length > 0) {
          const addr = addresses[0]
          setForm({
            nombre: addr.destinatario.split(' ')[0] || '',
            apellido: addr.destinatario.split(' ').slice(1).join(' ') || '',
            direccion: addr.direccion,
            ciudad: addr.ciudad,
            departamento: addr.departamento,
            telefono: addr.telefono,
          })
          setSelectedAddressId(addr.id)
        }
      } catch {
        toast.error('Error al cargar tus datos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const validate = (): boolean => {
    const errs: Partial<FormState> = {}
    if (!form.nombre.trim()) errs.nombre = 'Requerido'
    if (!form.apellido.trim()) errs.apellido = 'Requerido'
    if (!form.direccion.trim() || form.direccion.trim().length < 5) errs.direccion = 'Dirección muy corta'
    if (!form.ciudad.trim()) errs.ciudad = 'Requerido'
    if (!form.departamento.trim()) errs.departamento = 'Requerido'
    if (!form.telefono.trim() || !/^[+\d\s()-]{7,20}$/.test(form.telefono)) errs.telefono = 'Teléfono inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)

    try {
      let addressId = selectedAddressId

      if (!addressId) {
        const newAddr = await api.post<{ id: number }>('/addresses', {
          destinatario: `${form.nombre} ${form.apellido}`,
          direccion: form.direccion,
          ciudad: form.ciudad,
          departamento: form.departamento,
          telefono: form.telefono,
        })
        addressId = newAddr.id
      }

      await api.post('/orders', {
        address_id: addressId,
        payment_method: 'transferencia',
        keepCart: false,
      })

      localStorage.removeItem('productoParaComprar')
      localStorage.removeItem('cartCount')
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success('Pedido confirmado. Te contactaremos para coordinar el pago por Nequi.')
      router.push('/miperfil')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Error al procesar la compra'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!authenticated) return null

  if (loading) {
    return (
      <div className="container-main py-20">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="h-64 bg-pearl/60" />
          <div className="h-64 bg-pearl/60" />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="font-heading text-3xl text-ebony mb-4">Carrito Vacío</h1>
        <p className="text-stone mb-8">No hay productos en tu carrito.</p>
        <Button onClick={() => router.push('/catalogo')}>Explorar Catálogo</Button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <a href="/catalogo" className="hover:text-gold-400 transition-colors">Catálogo</a>
            <span>/</span>
            <span className="text-white/80">Checkout</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-light text-white tracking-[0.05em]">
            Finalizar Compra
          </h1>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 shadow-sm border border-black/4"
            >
              <h2 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                Información de Envío
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="nombre" label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} />
                <Input id="apellido" label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} error={errors.apellido} />
                <div className="md:col-span-2">
                  <Input id="direccion" label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} error={errors.direccion} />
                </div>
                <Input id="ciudad" label="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} error={errors.ciudad} />
                <Input id="departamento" label="Departamento" value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} error={errors.departamento} />
                <Input id="codigo-postal" label="Código Postal" />
                <Input id="telefono" label="Teléfono" type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} error={errors.telefono} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 shadow-sm border border-black/4"
            >
              <h2 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                Pago por Nequi
              </h2>
              <div className="bg-cream p-6 text-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="size-8 text-gold-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-ebony">Nequi</p>
                    <p className="text-xs text-stone">Transferencia directa desde la app Nequi</p>
                  </div>
                </div>
                <div className="border-t border-gold-400/20 pt-3 mt-3 space-y-1">
                  <p>Para completar tu compra:</p>
                  <p className="font-semibold text-ebony text-base">Cuenta: 310 787 5531</p>
                  <p className="text-xs text-silver">Titular: Julian Cortes</p>
                  <p className="text-xs text-stone mt-2">
                    Envía el comprobante de pago a <span className="font-semibold">info@victorem.co</span> para confirmar tu pedido.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 shadow-sm border border-black/4 sticky top-24"
            >
              <h2 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                Resumen
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-pearl/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ebony truncate">{item.name}</p>
                      <p className="text-xs text-stone">Cant: {item.cantidad}</p>
                    </div>
                    <p className="text-sm font-semibold text-gold-400">
                      {formatPrice(Number(item.price) * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm text-stone mb-2">
                <span>Envío</span>
                <span className="font-medium text-ebony">$10.000</span>
              </div>

              <div className="flex justify-between font-heading text-xl font-semibold text-gold-400 pt-4 border-t-2 border-pearl">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                loading={submitting}
                onClick={handleSubmit}
              >
                Confirmar Pedido
              </Button>

              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-pearl">
                {[
                  { icon: Lock, text: 'Pago Seguro (SSL)' },
                  { icon: CreditCard, text: 'Nequi · Transferencia' },
                  { icon: ShieldCheck, text: 'Compra Protegida' },
                  { icon: Truck, text: 'Envíos a Colombia' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-[0.6875rem] text-stone bg-snow p-2">
                    <item.icon className="size-3.5 shrink-0 text-gold-400" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
