'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatPrice, productImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function CarritoPage() {
  const router = useRouter()
  const { items, localItems, total, isLoading, updateQuantity, removeItem } = useCartStore()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [shippingConfig, setShippingConfig] = useState({ shipping: 10000, freeShippingThreshold: 200000 })
  const [updating, setUpdating] = useState<string | number | null>(null)

  const displayItems = isAuthenticated
    ? items.map(i => ({ id: i.id, name: i.name, price: Number(i.price), quantity: i.cantidad, imageUrl: i.image_url }))
    : localItems.map(i => ({ id: i.localId, name: i.name, price: i.price, quantity: i.quantity, imageUrl: i.imageUrl }))

  useEffect(() => {
    api.get<{ shipping: number, freeShippingThreshold: number }>('/config')
      .then(res => setShippingConfig(res))
      .catch(() => {})
  }, [])

  const handleUpdate = async (id: string | number, qty: number) => {
    setUpdating(id)
    await updateQuantity(id, qty)
    setUpdating(null)
  }

  const handleRemove = async (id: string | number) => {
    setUpdating(id)
    await removeItem(id)
    setUpdating(null)
    toast.success('Producto eliminado del carrito')
  }

  if (isLoading || authLoading) {
    return (
      <div className="container-main py-20">
        <div className="animate-pulse max-w-3xl mx-auto space-y-4">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="h-48 bg-pearl/60" />
          <div className="h-48 bg-pearl/60" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Carrito</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Tu Carrito
          </h1>
        </div>
      </div>

      <div className="container-main py-10">
        {displayItems.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <ShoppingBag className="size-16 text-pearl mx-auto mb-6" />
            <h2 className="font-heading text-2xl font-medium text-ebony mb-3">
              Carrito Vacío
            </h2>
            <p className="text-sm text-stone mb-8">
              Aún no has agregado productos a tu carrito. Explora nuestro catálogo y encuentra la pieza perfecta para ti.
            </p>
            <Button onClick={() => router.push('/catalogo')}>
              Explorar Catálogo <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {displayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white p-6 border border-black/4 flex items-center gap-6 ${
                    updating === item.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="size-20 bg-cream shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={productImageUrl(item.imageUrl) ?? undefined} alt={item.name} className="size-full object-cover" />
                    ) : (
                      <ShoppingBag className="size-6 text-stone" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-base font-medium text-ebony truncate">{item.name}</p>
                    <p className="text-sm text-gold-400 font-semibold mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 border border-pearl">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="size-9 flex items-center justify-center text-stone hover:text-ebony hover:bg-cream transition-colors disabled:opacity-30"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-ebony">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="size-9 flex items-center justify-center text-stone hover:text-ebony hover:bg-cream transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gold-400 min-w-[80px] text-right">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="size-9 flex items-center justify-center text-stone hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div>
              <div className="bg-white p-8 border border-black/4 sticky top-24">
                <h2 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                  Resumen
                </h2>
                <div className="space-y-3 text-sm">
                  {total < shippingConfig.freeShippingThreshold ? (
                    <div className="bg-cream p-3 border border-black/4 space-y-2 mb-4">
                      <p className="text-xs text-stone font-medium text-center">
                        ¡Faltan {formatPrice(shippingConfig.freeShippingThreshold - total)} para envío gratis!
                      </p>
                      <div className="w-full bg-pearl h-2 overflow-hidden">
                        <div 
                          className="bg-gold-400 h-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (total / shippingConfig.freeShippingThreshold) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 text-green-700 p-3 text-sm font-medium text-center mb-4 border border-green-200">
                      ¡Tienes envío gratis!
                    </div>
                  )}
                  
                  <div className="flex justify-between text-stone">
                    <span>Subtotal</span>
                    <span className="font-medium text-ebony">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Envío</span>
                    <span className="font-medium text-ebony">
                      {total >= shippingConfig.freeShippingThreshold ? 'Gratis' : formatPrice(shippingConfig.shipping)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-pearl flex justify-between font-heading text-xl font-semibold text-gold-400">
                    <span>Total</span>
                    <span>{formatPrice(total + (total >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.shipping))}</span>
                  </div>
                </div>
                <Button className="w-full mt-6" size="lg" onClick={() => router.push('/checkout')}>
                  Finalizar Compra <ArrowRight className="size-4 ml-2" />
                </Button>
                <p className="text-xs text-stone text-center mt-3">Envío: {formatPrice(shippingConfig.shipping)} a todo Colombia</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
