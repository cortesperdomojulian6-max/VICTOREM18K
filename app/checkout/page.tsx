'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Building2, ShieldCheck, Truck, Lock, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Address, User } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

interface FormState {
  nombre: string
  apellido: string
  direccion: string
  ciudad: string
  departamento: string
  telefono: string
}

type PaymentMethod = 'nequi' | 'wompi'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items: cartItems, total, syncFromServer: syncCart, clearCart } = useCartStore()
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  const [shippingConfig, setShippingConfig] = useState({ shipping: 10000, freeShippingThreshold: 200000 })
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wompi')
  const [form, setForm] = useState<FormState>({
    nombre: '', apellido: '', direccion: '', ciudad: '', departamento: '', telefono: '',
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
      toast.error('Debes iniciar sesión para continuar')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      try {
        const [userData, addresses, configRes] = await Promise.all([
          api.get<User>('/users/profile'),
          api.get<Address[]>('/addresses'),
          api.get<{ shipping: number, freeShippingThreshold: number }>('/config').catch(() => ({ shipping: 10000, freeShippingThreshold: 200000 }))
        ])
        setUserProfile(userData)
        setShippingConfig(configRes)

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
  }, [isAuthenticated])

  useEffect(() => {
    const status = searchParams.get('status')
    const transactionId = searchParams.get('transaction_id')
    if (status === 'success' && transactionId) {
      const verify = async () => {
        try {
          const result = await api.get<{ status: string }>(`/wompi/transaction/${transactionId}`)
          if (result.status === 'APPROVED') {
            toast.success('Pago exitoso. Tu pedido está siendo procesado.')
            router.push('/miperfil?tab=orders')
          } else if (result.status === 'PENDING') {
            toast.info('Pago pendiente de confirmación. Te notificaremos cuando se confirme.')
            router.push('/miperfil?tab=orders')
          } else {
            toast.error('El pago no pudo ser completado. Intenta de nuevo.')
          }
        } catch {
          toast.error('Error verificando tu pago. Contacta a soporte si el cargo ya fue realizado.')
          router.push('/miperfil?tab=orders')
        }
      }
      verify()
    } else if (status === 'failure') {
      toast.error('El pago fue cancelado o rechazado. Intenta de nuevo.')
    }
  }, [searchParams, router])

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

      const hasCustomization = !!localStorage.getItem('personalizacion')
      const tipo = hasCustomization ? 'personalizado' : 'catalogo'
      const paymentMethodForOrder = paymentMethod === 'wompi' ? 'wompi' : 'nequi'

      const order = await api.post<{
        id: number, total: number, numero_pedido: string, estado: string
      }>('/orders', {
        address_id: addressId,
        payment_method: paymentMethodForOrder,
        tipo,
        keepCart: paymentMethod === 'wompi',
      })

      const orderId = order.id

      if (hasCustomization) {
        try {
          const customData = JSON.parse(localStorage.getItem('personalizacion')!)
          await api.post('/custom-orders', {
            order_id: orderId,
            configuracion: customData,
            tipo_joya: customData.type || 'manilla',
            precio_total: order.total,
            talla_cm: customData.talla || null,
          })
          localStorage.removeItem('personalizacion')
        } catch (e) {
          console.error('Error saving customization:', e)
        }
      }

      if (paymentMethod === 'nequi') {
        clearCart()
        toast.success('Pedido confirmado. Te contactaremos para coordinar el pago por Nequi.')
        router.push('/miperfil?tab=orders')
        return
      }

      const wompiResult = await api.post<{
        success: boolean, transaction: { id: string, redirect_url?: string }
      }>('/wompi/create-payment', {
        amount: order.total,
        reference: order.numero_pedido,
        currency: 'COP',
        customerEmail: user?.email || userProfile?.email || '',
        orderId,
      })

      clearCart()

      if (wompiResult.transaction?.redirect_url) {
        window.location.href = wompiResult.transaction.redirect_url
      } else {
        toast.success('Pedido creado. Redirigiendo al pago...')
        router.push(`/miperfil?tab=orders`)
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Error al procesar la compra'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !isAuthenticated) return null

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
        <h1 className="font-heading text-3xl text-primary mb-4">Carrito Vacío</h1>
        <p className="text-muted mb-8">No hay productos en tu carrito.</p>
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
              className="bg-elevated p-8 shadow-sm border border-subtle"
            >
              <h2 className="font-heading text-xl font-medium text-primary mb-6 pb-3 border-b border-gold-400/30">
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
              className="bg-elevated p-8 shadow-sm border border-subtle"
            >
              <h2 className="font-heading text-xl font-medium text-primary mb-6 pb-3 border-b border-gold-400/30">
                Método de Pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('wompi')}
                  className={`p-5 border text-left transition-all ${
                    paymentMethod === 'wompi'
                      ? 'border-gold-400 bg-gold-400/5'
                      : 'border-subtle hover:border-gold-400/40 bg-elevated'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'wompi' ? 'border-gold-400' : 'border-stone/30'
                    }`}>
                      {paymentMethod === 'wompi' && (
                        <div className="size-2.5 rounded-full bg-gold-400" />
                      )}
                    </div>
                    <Smartphone className="size-6 text-gold-400" />
                  </div>
                  <p className="font-semibold text-primary text-sm">Pago Online</p>
                  <p className="text-xs text-muted mt-1">Nequi, PSE o Tarjeta vía Wompi</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('nequi')}
                  className={`p-5 border text-left transition-all ${
                    paymentMethod === 'nequi'
                      ? 'border-gold-400 bg-gold-400/5'
                      : 'border-subtle hover:border-gold-400/40 bg-elevated'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'nequi' ? 'border-gold-400' : 'border-stone/30'
                    }`}>
                      {paymentMethod === 'nequi' && (
                        <div className="size-2.5 rounded-full bg-gold-400" />
                      )}
                    </div>
                    <Building2 className="size-6 text-gold-400" />
                  </div>
                  <p className="font-semibold text-primary text-sm">Transferencia Nequi</p>
                  <p className="text-xs text-muted mt-1">Pago manual, te contactamos</p>
                </button>
              </div>

              {paymentMethod === 'nequi' && (
                <div className="bg-hover p-6 text-sm space-y-3 mt-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="size-8 text-gold-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-primary">Nequi</p>
                      <p className="text-xs text-muted">Transferencia directa desde la app Nequi</p>
                    </div>
                  </div>
                  <div className="border-t border-gold-400/20 pt-3 mt-3 space-y-1">
                    <p>Para completar tu compra:</p>
                    <p className="font-semibold text-primary text-base">Cuenta: 310 787 5531</p>
                    <p className="text-xs text-silver">Titular: Julian Cortes</p>
                    <p className="text-xs text-muted mt-2">
                      Envía el comprobante de pago a <span className="font-semibold">info@victorem.co</span> para confirmar tu pedido.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'wompi' && (
                <div className="bg-blue-50 p-6 text-sm space-y-3 mt-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-8 text-gold-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-primary">Pago Seguro con Wompi</p>
                      <p className="text-xs text-muted">Redirigiremos a la plataforma segura de Wompi para completar el pago.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-elevated p-8 shadow-sm border border-subtle sticky top-24"
            >
              <h2 className="font-heading text-xl font-medium text-primary mb-6 pb-3 border-b border-gold-400/30">
                Resumen
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                      <p className="text-xs text-muted">Cant: {item.cantidad}</p>
                    </div>
                    <p className="text-sm font-semibold text-gold-400">
                      {formatPrice(Number(item.price) * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm text-muted mb-2">
                <span>Envío</span>
                <span className="font-medium text-primary">
                  {total >= shippingConfig.freeShippingThreshold ? 'Gratis' : formatPrice(shippingConfig.shipping)}
                </span>
              </div>

              <div className="flex justify-between font-heading text-xl font-semibold text-gold-400 pt-4 border-t-2 border-border">
                <span>Total</span>
                <span>{formatPrice(total + (total >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.shipping))}</span>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                loading={submitting}
                onClick={handleSubmit}
              >
                {paymentMethod === 'wompi' ? 'Pagar con Wompi' : 'Confirmar Pedido'}
              </Button>

              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-border">
                {[
                  { icon: Lock, text: 'Pago Seguro (SSL)' },
                  { icon: CreditCard, text: 'Nequi · Transferencia' },
                  { icon: ShieldCheck, text: 'Compra Protegida' },
                  { icon: Truck, text: 'Envíos a Colombia' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-[0.6875rem] text-muted bg-surface p-2">
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
