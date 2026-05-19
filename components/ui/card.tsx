'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { Users } from 'lucide-react'

interface ProductCardProps {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  priority?: boolean
  view_count?: number
  onViewDetail?: () => void
}

const shimmer = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="#f5f0eb" width="600" height="600"/></svg>'
).toString('base64')

export function ProductCard({ id, name, description, price, imageUrl, priority, view_count, onViewDetail }: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(price)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuth'))
      return
    }
    setAdding(true)
    try {
      await addItem(id, 1)
      toast.success(`${name} agregado al carrito`)
    } catch {
      toast.error('Error al agregar al carrito')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="group bg-white border border-black/4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={600}
            priority={priority}
            placeholder="blur"
            blurDataURL={shimmer}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105 aspect-square"
          />
        ) : (
          <div className="aspect-square bg-cream flex items-center justify-center text-stone text-sm">
            Sin imagen
          </div>
        )}
      </div>
      
      {view_count && view_count > 0 && (
        <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-full font-medium">
            <Users className="size-3.5 text-gold-400" />
            <span>{view_count} personas viendo esto</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-2">
        <h3 className="font-heading text-xl font-medium text-iron tracking-wide">{name}</h3>
        <p className="text-sm text-stone leading-relaxed line-clamp-2">{description}</p>
        <p className="font-heading text-xl font-semibold text-gold-400 pt-1">{formattedPrice}</p>
        <div className="flex gap-2 pt-2">
          <div className="flex-1">
            <Button variant="outline" size="sm" className="w-full" onClick={onViewDetail}>Ver Detalles</Button>
          </div>
          <Button size="sm" className="flex-1" onClick={handleAddToCart} loading={adding} disabled={adding}>
            {adding ? 'Agregando...' : 'Agregar'}
          </Button>
        </div>
      </div>
    </article>
  )
}
