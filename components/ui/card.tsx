import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './button'

interface ProductCardProps {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  priority?: boolean
}

export function ProductCard({ id, name, description, price, imageUrl, priority }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(price)

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
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105 aspect-square"
          />
        ) : (
          <div className="aspect-square bg-cream flex items-center justify-center text-stone text-sm">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-6 space-y-2">
        <h3 className="font-heading text-xl font-medium text-iron tracking-wide">{name}</h3>
        <p className="text-sm text-stone leading-relaxed line-clamp-2">{description}</p>
        <p className="font-heading text-xl font-semibold text-gold-400 pt-1">{formattedPrice}</p>
        <div className="flex gap-2 pt-2">
          <Link href={`/catalogo?id=${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Ver Detalles</Button>
          </Link>
          <Button size="sm" className="flex-1">Agregar</Button>
        </div>
      </div>
    </article>
  )
}
