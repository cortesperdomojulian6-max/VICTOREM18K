'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { toast } from 'sonner'

const PRODUCTS = [
  { name: 'Pulsera Van Cleef Dorada', desc: 'Diseño contemporáneo con balinería multiformato y acabado dorado brillante.', price: '$ 165.000', img: '/assets/images/van cleef dorada.jpeg' },
  { name: 'Anillo Tres Carriles', desc: 'Elegancia estructurada con tres bandas de balines en oro de alta calidad.', price: '$ 180.000', img: '/assets/images/AnilloTresCarriles.jpg' },
  { name: 'Diseño Exclusivo', desc: 'Pieza única tejida a mano con balines de oro y detalles de alta gama.', price: '$ 210.000', img: '/assets/images/AnilloDiseñoExclusivo.jpg' },
  { name: 'Manilla Dollar', desc: 'Símbolo de sofisticación y estatus con placa central y balines labrados.', price: '$ 195.000', img: '/assets/images/ManillaDollar.jpg' },
]

function MagneticButton({ children, className, asLink, href, onClick, ...props }: any) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const cx = (e.clientX - left - width / 2) * 0.4
    const cy = (e.clientY - top - height / 2) * 0.4
    x.set(cx)
    y.set(cy)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const content = (
    <motion.div
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      {asLink ? <Link href={href || '#'}>{content}</Link> : content}
    </div>
  )
}

function LetterReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ')
  let charIndex = 0
  return (
    <span className={cn("inline flex-wrap", className)}>
      {words.map((word, w) => (
        <span key={w} className="inline-flex whitespace-nowrap">
          {word.split('').map((char) => {
            const currentIndex = charIndex++
            return (
              <motion.span
                key={currentIndex}
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: delay + currentIndex * 0.035,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ perspective: '800px' }}
              >
                {char}
              </motion.span>
            )
          })}
          {w < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  )
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9])

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-background"
    >
      {/* Warm ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(115,92,0,0.04) 0%, transparent 60%)',
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full border border-metallic-gold/10"
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full border border-primary/10"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        {/* Decorative corner */}
        <div className="hidden md:block absolute -right-12 top-1/4 w-32 h-32 border border-metallic-gold/20" />
      </div>

      <div className="container-main relative z-10 w-full">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[80vh]">
          <motion.div style={{ scale }} className="md:col-span-5 text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-metallic-gold text-[10px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <Sparkles className="size-3" />
              COLECCIÓN ARTESANAL 2026
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal-obsidian mb-6 leading-tight">
              <LetterReveal text="DONDE EL ORO" delay={0.4} />
              <br />
              <LetterReveal text="ENCUENTRA SU FORMA" delay={1.0} className="text-metallic-gold" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="text-sm md:text-base text-on-surface-variant max-w-md mx-auto md:mx-0 mb-10 leading-relaxed"
            >
              Artesanía en balinería de oro laminado 18K. Piezas únicas tejidas a mano para quienes entienden la diferencia entre un accesorio y una declaración.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="flex flex-col sm:flex-row items-center md:items-start gap-4"
            >
              <MagneticButton asLink href="/catalogo">
                <div className="min-w-[180px] px-8 py-4 bg-primary text-on-primary text-xs font-bold uppercase tracking-[0.2em] hover:bg-charcoal-obsidian transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group">
                  Colección
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </MagneticButton>
              <MagneticButton asLink href="/personalizacion">
                <div className="min-w-[180px] px-8 py-4 border border-charcoal-obsidian text-charcoal-obsidian text-xs font-bold uppercase tracking-[0.2em] hover:bg-charcoal-obsidian hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center">
                  Personaliza
                </div>
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden md:flex md:col-span-7 items-center justify-center relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[380px] h-[480px] lg:w-[480px] lg:h-[580px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-metallic-gold/8 via-transparent to-primary/5 rounded-full blur-3xl" />
              <div className="relative size-full overflow-hidden luxury-shadow">
                <Image
                  src="/assets/images/van cleef dorada.jpeg"
                  alt="Pulsera Van Cleef Dorada"
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-gradient-to-r from-transparent via-metallic-gold/15 to-transparent blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">Descubre</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-metallic-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

function CraftsmanshipSection() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-soft-parchment">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-metallic-gold/[0.02] to-transparent pointer-events-none" />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.15em] block mb-3">TRADICIÓN</span>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-charcoal-obsidian tracking-tight">
            El Arte del <span className="text-metallic-gold">Balín Perfecto</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="col-span-2 row-span-2 relative overflow-hidden bg-gradient-to-br from-charcoal-obsidian to-ebony border border-border-subtle group cursor-pointer"
          >
            <Image
              src="/assets/images/Historia.jpg"
              alt="Artesanía Victorem"
              fill
              className="object-cover opacity-70 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-obsidian/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs text-metallic-gold/80 uppercase tracking-[0.15em] mb-2">Tradición</p>
              <h3 className="font-heading text-xl md:text-2xl text-white font-semibold">Hecho a Mano en Campoalegre</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white border border-border-subtle p-6 md:p-8 flex flex-col justify-center group hover:border-metallic-gold/40 transition-all luxury-shadow luxury-shadow-hover"
          >
            <span className="text-3xl md:text-4xl text-metallic-gold mb-3">✦</span>
            <h3 className="font-heading text-base md:text-lg text-charcoal-obsidian font-semibold mb-2">Selección</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Cada balín se examina por brillo, tamaño y consistencia antes de ser tejido.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white border border-border-subtle p-6 md:p-8 flex flex-col justify-center group hover:border-metallic-gold/40 transition-all luxury-shadow luxury-shadow-hover"
          >
            <span className="text-3xl md:text-4xl text-metallic-gold mb-3">◎</span>
            <h3 className="font-heading text-base md:text-lg text-charcoal-obsidian font-semibold mb-2">Tejido</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Enhebrado uno por uno sobre hilo de alta resistencia formando patrones precisos.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white border border-border-subtle p-6 md:p-8 flex flex-col justify-center group hover:border-metallic-gold/40 transition-all luxury-shadow luxury-shadow-hover"
          >
            <span className="text-3xl md:text-4xl text-metallic-gold mb-3">◈</span>
            <h3 className="font-heading text-base md:text-lg text-charcoal-obsidian font-semibold mb-2">Montaje</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Incorporación de dijones y ajuste de tensión para simetría perfecta.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white border border-border-subtle p-6 md:p-8 flex flex-col justify-center group hover:border-metallic-gold/40 transition-all luxury-shadow luxury-shadow-hover"
          >
            <span className="text-3xl md:text-4xl text-metallic-gold mb-3">✨</span>
            <h3 className="font-heading text-base md:text-lg text-charcoal-obsidian font-semibold mb-2">Acabado</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Pulido final y control de calidad antes de ser empacada a mano.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/historia">
            <Button variant="ghost" className="text-metallic-gold hover:text-charcoal-obsidian text-xs uppercase tracking-widest group">
              Conoce Nuestra Historia <ArrowRight className="size-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function ProductsSection() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-20 md:py-28 bg-background transition-colors duration-500 overflow-hidden">
      <div className="container-main mb-10 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.2em] block mb-3">COLECCIÓN</span>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-charcoal-obsidian tracking-tight">
              Piezas Destacadas
            </h2>
          </div>
          <Link href="/catalogo" className="group flex items-center gap-3 text-sm text-on-surface-variant hover:text-metallic-gold transition-colors shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider">Ver Todo</span>
            <div className="w-8 h-px bg-on-surface-variant group-hover:bg-metallic-gold group-hover:w-12 transition-all" />
          </Link>
        </motion.div>
      </div>

      <div
        ref={marqueeRef}
        className="flex gap-4 md:gap-6 px-4 overflow-hidden"
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 md:gap-6 shrink-0"
          style={{ willChange: 'transform' }}
        >
          {[...PRODUCTS, ...PRODUCTS].map((product, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="group relative w-[260px] md:w-[320px] shrink-0 bg-white border border-border-subtle overflow-hidden transition-all duration-500 luxury-shadow luxury-shadow-hover"
            >
              <Link href="/catalogo">
                <div className="aspect-[4/5] overflow-hidden relative bg-surface-container">
                  <Image
                    src={product.img}
                    alt={product.name}
                    width={600}
                    height={750}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-obsidian/80 via-charcoal-obsidian/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <span className="w-full py-2.5 bg-primary text-on-primary text-[10px] uppercase font-bold tracking-widest text-center block hover:bg-charcoal-obsidian transition-all">
                      Ver Detalle
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4 md:p-5">
                <h3 className="font-heading text-base md:text-lg font-semibold text-charcoal-obsidian mb-1">{product.name}</h3>
                <p className="text-xs text-on-surface-variant mb-3 line-clamp-2 leading-relaxed">{product.desc}</p>
                <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
                  <span className="text-metallic-gold font-bold text-sm md:text-base">{product.price}</span>
                  <button className="text-on-surface-variant hover:text-metallic-gold transition-colors">
                    <Star className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-12 container-main"
      >
        <Link href="/catalogo">
          <Button variant="outline" className="text-xs uppercase tracking-[0.2em]">
            Explorar Catálogo Completo <ArrowRight className="size-3.5 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    { icon: '✦', title: 'Selección de Balines', desc: 'Elegimos la mejor balinería de oro laminado 18K, clasificando cada esfera por tamaño, brillo y consistencia.' },
    { icon: '◎', title: 'Tejido Artesanal', desc: 'Cada balín se enhebra y asegura uno por uno sobre hilo de alta resistencia, formando patrones precisos.' },
    { icon: '◈', title: 'Montaje y Detalles', desc: 'Incorporamos dijones y neoprenos seleccionados, ajustando la tensión y simetría de cada pieza.' },
    { icon: '✨', title: 'Acabado y Control', desc: 'Cada joya recibe un pulido final y pasa por control de calidad antes de ser empacada a mano.' },
  ]
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-surface-container">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-metallic-gold/[0.02] to-transparent pointer-events-none" />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Proceso</span>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-charcoal-obsidian tracking-tight">
            Hecho a Mano, Paso a Paso
          </h2>
          <p className="text-sm text-on-surface-variant mt-4 max-w-md mx-auto">
            Cada pieza Victorem sigue un proceso artesanal riguroso, desde la selección del material hasta el empaque final.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-8 bg-white border border-border-subtle hover:border-metallic-gold/40 transition-all group luxury-shadow luxury-shadow-hover"
            >
              <span className="text-3xl text-metallic-gold block mb-4 group-hover:scale-110 transition-transform inline-block">
                {s.icon}
              </span>
              <h3 className="font-heading text-lg font-semibold text-charcoal-obsidian mb-3">{s.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      setStatus('success')
      setEmail('')
      toast.success('¡Te has suscrito exitosamente!')
    } else {
      setStatus('error')
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data?.error || 'Ocurrió un error. Intenta de nuevo.')
      toast.error(data?.error || 'Ocurrió un error. Intenta de nuevo.')
    }
  }

  return (
    <section className="relative py-24 md:py-28 overflow-hidden bg-background">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center border border-border-subtle p-8 md:p-16 luxury-shadow"
        >
          <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.15em] block mb-4">Newsletter</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal-obsidian mb-4">
            Únete al Círculo Victorem
          </h2>
          <p className="text-sm text-on-surface-variant mb-10 max-w-md mx-auto">
            Acceso anticipado a colecciones limitadas, invitaciones a eventos exclusivos y un trato preferencial en cada compra.
          </p>
          {status === 'success' ? (
            <p className="text-green-600 font-medium text-sm">¡Te has suscrito exitosamente!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                disabled={status === 'loading'}
                className="flex-1 bg-transparent border-b border-charcoal-obsidian px-2 py-3 text-sm text-charcoal-obsidian focus:outline-none focus:border-metallic-gold transition-all placeholder:text-on-surface-variant/50 disabled:opacity-50"
              />
              <Button type="submit" disabled={status === 'loading'} className="bg-charcoal-obsidian text-white hover:bg-metallic-gold disabled:opacity-50 transition-all uppercase tracking-widest text-xs font-bold px-8 min-w-[140px]">
                {status === 'loading' ? 'Enviando...' : 'SUSCRIBIRME'}
              </Button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-xs mt-3">{errorMsg}</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'María Camila R.', role: 'Cliente frecuente', text: 'Compré una pulsera personalizada y el resultado superó mis expectativas. La atención al detalle es increíble, se nota que es hecho a mano con amor.', rating: 5 },
    { name: 'Carlos A. Gutiérrez', role: 'Coleccionista', text: 'He comprado joyas en varios lugares, pero Victorem tiene algo especial. La calidad del oro laminado y la precisión del tejido artesanal no tienen comparación.', rating: 5 },
    { name: 'Valentina S. López', role: 'Novia Victorem 2025', text: 'Encargué las joyas para mi matrimonio. Cada invitado preguntó dónde las había comprado. Recibí mi pedido antes de lo esperado y en un empaque hermoso.', rating: 5 },
    { name: 'Andrés F. Martínez', role: 'Cliente mayorista', text: 'Como joyero, valoro la consistencia. Compro insumos regularmente y siempre recibo balines de primera calidad. Excelente relación calidad-precio.', rating: 5 },
  ]
  
  const [active, setActive] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <section className="py-24 md:py-28 bg-charcoal-obsidian">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.15em] block mb-3">NUESTRA HERENCIA</span>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-white tracking-tight">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[280px]">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={active === i ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${active === i ? 'relative' : 'absolute pointer-events-none'}`}
              >
                <div className="bg-white/[0.03] border border-white/[0.06] p-8 md:p-10 text-center">
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-4 fill-metallic-gold text-metallic-gold" />
                    ))}
                  </div>
                  <p className="text-base md:text-lg text-tertiary-fixed/80 leading-relaxed mb-8 italic font-light">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-heading text-base font-medium text-white">{t.name}</p>
                    <p className="text-xs text-metallic-gold/60 mt-1">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`size-2 rounded-full transition-all duration-300 ${
                  active === i ? 'bg-metallic-gold w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Testimonio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CraftsmanshipSection />
      <ProductsSection />
      <TestimonialsSection />
      <ProcessSection />
      <NewsletterSection />
    </>
  )
}
