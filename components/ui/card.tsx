'use client'

import { useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './button'
import { toast } from 'sonner'
import { useCartStore } from '@/store/useCartStore'
import { Users, Eye } from 'lucide-react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

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
  const { addItem } = useCartStore()
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const posX = (e.clientX - left) / width
    const posY = (e.clientY - top) / height
    x.set((posX - 0.5) * 20)
    y.set((posY - 0.5) * -20)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(price)

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await addItem(id, 1, { name, price, imageUrl: imageUrl ?? '' })
      toast.success(`${name} agregado al carrito`)
    } catch {
      toast.error('Error al agregar al carrito')
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX: springY, rotateY: springX, transformStyle: 'preserve-3d' }}
      className="group relative bg-elevated border border-subtle transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(212,175,55,0.08)]"
    >
      <div className="relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={600}
            priority={priority}
            placeholder="blur"
            blurDataURL={shimmer}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110 aspect-square"
          />
        ) : (
          <div className="aspect-square bg-cream flex items-center justify-center text-stone text-sm">
            Sin imagen
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
        />

        {view_count && view_count > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/80 text-[10px] px-2.5 py-1.5 font-medium">
              <Users className="size-3 text-gold-400" />
              <span>{view_count} viendo</span>
            </div>
          </div>
        )}

        <motion.div
          initial={false}
          whileHover={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={onViewDetail}>
              <Eye className="size-3.5 mr-1.5" /> Ver
            </Button>
            <Button size="sm" className="flex-1 bg-gold-400 text-ebony hover:bg-gold-300" onClick={handleAddToCart} loading={adding} disabled={adding}>
              {adding ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="p-5 space-y-2">
        <h3 className="font-heading text-lg font-medium text-iron tracking-wide">{name}</h3>
        <p className="text-xs text-stone leading-relaxed line-clamp-2">{description}</p>
        <p className="font-heading text-lg font-semibold text-gold-400 pt-1">{formattedPrice}</p>
      </div>
    </motion.article>
  )
}
