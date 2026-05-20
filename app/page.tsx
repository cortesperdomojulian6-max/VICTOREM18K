'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ui/card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { ParticlesCanvas } from '@/components/ui/particles-canvas'
import { WalkingTioRico } from '@/components/ui/walking-tio'
import { api } from '@/lib/api'
import type { Product } from '@/types'
import { motion, useScroll, useTransform } from 'framer-motion'
import { toast } from 'sonner'

const TESTIMONIALS = [
  {
    text: 'La calidad es excepcional. Mi manilla personalizada es una obra de arte que uso todos los días. El proceso de personalización fue muy fácil y el resultado superó mis expectativas.',
    author: 'María González',
  },
  {
    text: 'Compré un anillo para mi esposa y quedó encantada. La atención al detalle y la elegancia del diseño son incomparables. Definitivamente volveré por más piezas.',
    author: 'Carlos Rodríguez',
  },
  {
    text: 'El trabajo artesanal es impresionante. Cada balín está perfectamente colocado y el acabado en oro es hermoso. Una inversión que vale la pena para una joya única.',
    author: 'Ana Martínez',
  },
]

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-ebony">
      <ParticlesCanvas className="absolute inset-0 z-[1] pointer-events-none" />
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-ebony to-charcoal" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center 40%, rgba(212,175,55,0.15) 0%, transparent 60%)' }} />
        <WalkingTioRico />
      </div>
      <motion.div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60 z-[2]" style={{ opacity }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-snow to-transparent z-[2]" style={{ opacity }} />

      <div className="container-main relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="mx-auto mb-7">
            <Image
              src="/images/logo.png"
              alt="Victorem"
              width={120}
              height={120}
              className="mx-auto drop-shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
              priority
            />
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-light tracking-[0.15em] md:tracking-[0.2em] text-white mb-4">
            VICTOREM
          </h1>
          <div className="w-14 h-px bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 mx-auto my-5" />
          <p className="font-heading text-lg md:text-xl font-light tracking-[0.15em] text-gold-200 mb-3">
            Arte en cada balín, elegancia en cada detalle
          </p>
          <p className="text-sm md:text-base text-white/70 max-w-lg mx-auto mb-10 font-light leading-relaxed">
            La perfecta fusión entre tradición artesanal y diseño contemporáneo en cada una de nuestras creaciones únicas
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalogo">
              <Button size="lg" className="min-w-[200px]">
                Explorar Catálogo <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link href="/personalizacion">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Crear Joya Única
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ backgroundImage: "url('/images/textura.png')", backgroundSize: 'cover', backgroundPosition: 'center', y: bgY }}
      />
    </section>
  )
}

function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const slidesPerView = isMobile ? 1 : 3
  const maxIndex = Math.max(0, products.length - slidesPerView)

  const goTo = (i: number) => setIndex(Math.max(0, Math.min(i, maxIndex)))

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={trackRef}>
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(-${index * (100 / slidesPerView)}%)` }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="shrink-0 px-2"
              style={{ flex: `0 0 ${100 / slidesPerView}%`, maxWidth: `${100 / slidesPerView}%` }}
            >
              <ProductCard
                id={p.id}
                name={p.name}
                description={p.description || ''}
                price={Number(p.price)}
                imageUrl={p.image_url?.replace(/^imagenes\//, '/assets/images/') || null}
              />
            </div>
          ))}
        </div>
      </div>

      {!isMobile && products.length > slidesPerView && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="absolute top-1/2 -left-0 -translate-y-1/2 size-11 bg-white border border-pearl shadow-md flex items-center justify-center hover:bg-ebony hover:text-gold-400 hover:border-ebony transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index >= maxIndex}
            className="absolute top-1/2 -right-0 -translate-y-1/2 size-11 bg-white border border-pearl shadow-md flex items-center justify-center hover:bg-ebony hover:text-gold-400 hover:border-ebony transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <motion.div className="flex justify-center gap-1.5 mt-8">
        {Array.from({ length: Math.ceil(products.length / slidesPerView) }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i * slidesPerView)}
            className={`h-0.5 transition-all duration-300 ${
              i === Math.floor(index / slidesPerView) ? 'w-9 bg-gold-400' : 'w-6 bg-pearl hover:bg-gold-200'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </motion.div>
    </div>
  )
}

function TestimonialsSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="block text-xs text-gold-400 font-semibold uppercase tracking-[0.15em] mb-3">Testimonios</span>
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-ebony tracking-wide">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white p-8 border border-black/4 relative hover:border-gold-400/25 hover:shadow-xl transition-all duration-300"
            >
              <span className="font-heading text-5xl text-gold-400/30 absolute top-3 left-5 leading-none" aria-hidden="true">
                &ldquo;
              </span>
              <div className="flex gap-1 mb-4" aria-label="5 estrellas">
                {Array.from({ length: 5 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + j * 0.08, type: 'spring', stiffness: 300 }}
                  >
                    <Star className="size-4 fill-gold-400 text-gold-400" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-stone leading-relaxed mb-4 italic relative z-[1]">
                {t.text}
              </p>
              <p className="font-heading text-sm font-semibold text-ebony tracking-wide">
                {t.author}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('victorem_newsletter_email')
    if (stored) {
      setEmail(stored)
      setSaved(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setLoading(true)
    try {
      const result = await api.post<{ ok: boolean; message: string }>('/newsletter', { email })
      localStorage.setItem('victorem_newsletter_email', email)
      setSaved(true)
      toast.success(result.message || 'Gracias por suscribirte')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al suscribirte'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section-padding bg-ebony text-white text-center">
      <div className="container-main max-w-lg">
        <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-wide text-white mb-3">
          Mantente Inspirado
        </h2>
        <p className="text-sm text-silver mb-8">
          Recibe novedades, colecciones exclusivas y ofertas especiales directamente en tu correo.
        </p>

        {saved ? (
          <p className="text-sm text-gold-200">
            Ya estás suscrita con <span className="font-semibold">{email}</span>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 text-white text-sm placeholder:text-silver/50 focus:outline-none focus:border-gold-400 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)] transition-all"
            />
            <Button type="submit" loading={loading}>
              Suscribirme
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Product[]>('/products')
      .then((data) => setProducts(data.slice(0, 9)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <HeroSection />

      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="block text-xs text-gold-400 font-semibold uppercase tracking-[0.15em] mb-3">Colección</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-ebony tracking-wide">
              Productos Destacados
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ProductCarousel products={products} />
          )}
        </div>
      </section>

      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
