'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ShoppingBag, Heart, Share2, Minus, Plus, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { formatPrice, productImageUrl } from '@/lib/utils'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/types'

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

const COLORS = [
  { name: 'Oro', value: '#d4af37' },
  { name: 'Plata', value: '#c0c0c0' },
  { name: 'Rosado', value: '#e8a0b4' },
  { name: 'Negro', value: '#1a1a1a' },
]

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#d4af37')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [recsLoading, setRecsLoading] = useState(false)

  useEffect(() => {
    if (!product) return
    setRecsLoading(true)
    api.get<Product[]>(`/recommendations/${product.id}`)
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false))
  }, [product])

  if (!product) return null

  const imageUrl = productImageUrl(product.image_url)

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) { window.dispatchEvent(new CustomEvent('openAuth')); return }

    setAdding(true)
    try {
      await api.post('/cart/items', { product_id: product.id, quantity })
      const currentCount = Number(localStorage.getItem('cartCount') || '0')
      localStorage.setItem('cartCount', String(currentCount + quantity))
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast.success(`${product.name} agregado al carrito`)
      onClose()
    } catch {
      toast.error('Error al agregar al carrito')
    } finally {
      setAdding(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-elevated w-full max-w-5xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl border border-gold-400/20"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
              <h2 className="font-heading text-lg font-semibold text-primary truncate pr-4">
                {product.name}
              </h2>
              <button onClick={onClose} className="text-silver hover:text-primary transition-colors shrink-0" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border-r border-border bg-surface flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-muted text-sm">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mb-1">
                    {product.category || 'Joyas'}
                  </p>
                  <h3 className="font-heading text-2xl font-semibold text-primary">
                    {product.name}
                  </h3>
                  <p className="font-heading text-3xl font-bold text-gold-400 mt-3">
                    {formatPrice(Number(product.price))}
                  </p>
                </div>

                <div>
                  <p className={`text-sm text-muted leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                    {product.description || 'Pieza artesanal elaborada en balinería con oro laminado 18K.'}
                  </p>
                  {product.description && product.description.length > 120 && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="text-xs text-gold-400 font-semibold mt-1 hover:underline"
                    >
                      {showFullDesc ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>

                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Características</p>
                    <ul className="space-y-1">
                      {product.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-iron">
                          <ChevronRight className="size-3.5 text-gold-400 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Colores disponibles</p>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setSelectedColor(c.value)}
                        className={`size-7 rounded-full border-2 transition-all ${
                          selectedColor === c.value
                            ? 'border-gold-400 scale-110 shadow-md'
                            : 'border-white shadow-sm hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.value }}
                        aria-label={c.name}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="size-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface transition-colors"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-[40px] text-center text-sm font-semibold text-primary select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="size-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-muted">
                    {formatPrice(Number(product.price) * quantity)}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    loading={adding}
                  >
                    <ShoppingBag className="size-4 mr-2" /> Agregar al Carrito
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Guardar">
                    <Heart className="size-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted space-y-1 pt-2 border-t border-border">
                  <p>✓ Envíos a toda Colombia</p>
                  <p>✓ Pago seguro con Nequi</p>
                  <p>✓ Hecho a mano con oro laminado 18K</p>
                </div>
              </div>
            </div>

            {recsLoading ? (
              <div className="border-t border-border p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-pearl/60 w-48" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-pearl/40 flex-1 rounded" />)}
                  </div>
                </div>
              </div>
            ) : recommendations.length > 0 && (
              <div className="border-t border-border p-6 bg-surface/30">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">También te puede interesar</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => window.location.href = `/catalogo?id=${rec.id}`}
                      className="flex items-center gap-3 p-3 bg-elevated border border-border hover:border-gold-400/50 transition-all text-left"
                    >
                      <div className="size-14 shrink-0 bg-surface flex items-center justify-center overflow-hidden">
                        {rec.image_url ? (
                          <Image src={productImageUrl(rec.image_url) ?? ''} alt={rec.name} width={56} height={56} className="object-contain" />
                        ) : (
                          <div className="size-8 bg-pearl/40 rounded" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary truncate">{rec.name}</p>
                        <p className="text-xs text-gold-400 font-semibold">{formatPrice(Number(rec.price))}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
