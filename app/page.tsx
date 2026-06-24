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
  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.035,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
          style={{ perspective: '800px' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const productRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!productRef.current) return
    const { left, top, width, height } = productRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setMousePos({ x, y })
  }, [])

  const productRotateX = mousePos.y * -20
  const productRotateY = mousePos.x * 20

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden bg-ebony"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-ebony via-ebony to-charcoal" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(212,175,55,0.04) 0%, transparent 60%)',
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full border border-gold-400/5"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full border border-gold-400/8"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <motion.div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[2]" style={{ opacity }} />

      <div className="container-main relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[80vh]">
          <motion.div style={{ scale }} className="text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-gold-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <Sparkles className="size-3" />
              Colección Artesanal 2026
            </motion.span>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.08em] text-white mb-4 leading-none">
              <LetterReveal text="DONDE EL ORO" delay={0.4} />
              <br />
              <LetterReveal text="ENCUENTRA SU FORMA" delay={1.0} className="text-gold-400" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="text-sm md:text-base text-white/40 max-w-md mx-auto md:mx-0 mb-10 font-light leading-relaxed tracking-wider"
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
                <div className="min-w-[180px] px-6 py-3.5 bg-gold-400 text-ebony text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-300 transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 group">
                  Colección
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </MagneticButton>
              <MagneticButton asLink href="/personalizacion">
                <div className="min-w-[180px] px-6 py-3.5 border border-gold-400/30 text-gold-400 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-400/10 hover:border-gold-400/60 transition-all duration-300 cursor-pointer flex items-center justify-center">
                  Personaliza
                </div>
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            ref={productRef}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden md:flex items-center justify-center relative"
            style={{
              rotateX: productRotateX,
              rotateY: productRotateY,
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[400px] h-[500px] lg:w-[500px] lg:h-[600px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-transparent to-gold-400/5 rounded-full blur-3xl" />
              <div className="relative size-full overflow-hidden">
                <Image
                  src="/assets/images/van cleef dorada.jpeg"
                  alt="Pulsera Van Cleef Dorada"
                  fill
                  className="object-contain p-8 drop-shadow-[0_0_60px_rgba(212,175,55,0.15)]"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-gradient-to-r from-transparent via-gold-400/20 to-transparent blur-2xl" />
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
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Descubre</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-gold-400/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

function CraftsmanshipSection() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-ebony">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/[0.02] to-transparent pointer-events-none" />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Artesanía</span>
          <h2 className="font-heading text-3xl md:text-5xl font-light text-white tracking-wide">
            El Arte del <span className="text-gold-400">Balín Perfecto</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="col-span-2 row-span-2 relative overflow-hidden bg-gradient-to-br from-stone-950 to-ebony border border-white/5 group cursor-pointer"
          >
            <Image
              src="/assets/images/Historia.jpg"
              alt="Artesanía Victorem"
              fill
              className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ebony via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs text-gold-400/80 uppercase tracking-[0.15em] mb-2">Tradición</p>
              <h3 className="font-heading text-xl md:text-2xl text-white font-medium">Hecho a Mano en Campoalegre</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 flex flex-col justify-center group hover:border-gold-400/20 transition-all"
          >
            <span className="text-3xl md:text-4xl text-gold-400 mb-3">✦</span>
            <h3 className="font-heading text-base md:text-lg text-white font-medium mb-2">Selección</h3>
            <p className="text-xs text-silver/50 leading-relaxed">Cada balín se examina por brillo, tamaño y consistencia antes de ser tejido.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 flex flex-col justify-center group hover:border-gold-400/20 transition-all"
          >
            <span className="text-3xl md:text-4xl text-gold-400 mb-3">◎</span>
            <h3 className="font-heading text-base md:text-lg text-white font-medium mb-2">Tejido</h3>
            <p className="text-xs text-silver/50 leading-relaxed">Enhebrado uno por uno sobre hilo de alta resistencia formando patrones precisos.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 flex flex-col justify-center group hover:border-gold-400/20 transition-all"
          >
            <span className="text-3xl md:text-4xl text-gold-400 mb-3">◈</span>
            <h3 className="font-heading text-base md:text-lg text-white font-medium mb-2">Montaje</h3>
            <p className="text-xs text-silver/50 leading-relaxed">Incorporación de dijones y ajuste de tensión para simetría perfecta.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 flex flex-col justify-center group hover:border-gold-400/20 transition-all"
          >
            <span className="text-3xl md:text-4xl text-gold-400 mb-3">✨</span>
            <h3 className="font-heading text-base md:text-lg text-white font-medium mb-2">Acabado</h3>
            <p className="text-xs text-silver/50 leading-relaxed">Pulido final y control de calidad antes de ser empacada a mano.</p>
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
            <Button variant="ghost" className="text-gold-400 hover:text-gold-300 text-xs uppercase tracking-widest group">
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
    <section className="py-20 md:py-28 bg-surface dark:bg-ebony transition-colors duration-500 overflow-hidden">
      <div className="container-main mb-10 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em] block mb-3">Colección</span>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-ebony dark:text-white tracking-wide">
              Piezas Destacadas
            </h2>
          </div>
          <Link href="/catalogo" className="group flex items-center gap-3 text-sm text-stone dark:text-silver hover:text-gold-400 transition-colors shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider">Ver Todo</span>
            <div className="w-8 h-px bg-stone dark:bg-silver group-hover:bg-gold-400 group-hover:w-12 transition-all" />
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
              className="group relative w-[260px] md:w-[320px] shrink-0 bg-white dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]"
            >
              <Link href="/catalogo">
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-950">
                  <Image
                    src={product.img}
                    alt={product.name}
                    width={600}
                    height={750}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <span className="w-full py-2.5 bg-gold-400 text-ebony text-[10px] uppercase font-bold tracking-widest text-center block hover:bg-gold-300 transition-all">
                      Ver Detalle
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4 md:p-5">
                <h3 className="font-heading text-base md:text-lg font-medium text-gold-400 mb-1">{product.name}</h3>
                <p className="text-xs text-stone dark:text-silver mb-3 line-clamp-2 font-light leading-relaxed">{product.desc}</p>
                <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                  <span className="text-gold-400 font-bold text-sm md:text-base">{product.price}</span>
                  <button className="text-stone dark:text-silver hover:text-gold-400 transition-colors">
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
          <Button variant="outline" className="text-xs uppercase tracking-[0.2em] border-stone/30 text-stone hover:border-gold-400 hover:text-gold-400 transition-all">
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
    <section className="relative py-28 md:py-36 overflow-hidden bg-ebony">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/[0.02] to-transparent pointer-events-none" />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Proceso</span>
          <h2 className="font-heading text-3xl md:text-5xl font-medium text-white tracking-wide">
            Hecho a Mano, Paso a Paso
          </h2>
          <p className="text-sm text-silver/50 mt-4 max-w-md mx-auto font-light">
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
              className="text-center p-8 bg-white/[0.02] border border-white/[0.06] hover:border-gold-400/20 transition-all group"
            >
              <span className="text-3xl text-gold-400 block mb-4 group-hover:scale-110 transition-transform inline-block">
                {s.icon}
              </span>
              <h3 className="font-heading text-lg font-medium text-white mb-3">{s.title}</h3>
              <p className="text-sm text-silver/50 leading-relaxed">{s.desc}</p>
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
    <section className="relative py-24 md:py-28 overflow-hidden bg-surface dark:bg-ebony">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-4">Newsletter</span>
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-ebony dark:text-white mb-4">
            Únete al Círculo Victorem
          </h2>
          <p className="text-sm text-stone dark:text-silver/60 mb-10 max-w-md mx-auto">
            Acceso anticipado a colecciones limitadas, invitaciones a eventos exclusivos y un trato preferencial en cada compra.
          </p>
          {status === 'success' ? (
            <p className="text-green-500 font-medium text-sm">¡Te has suscrito exitosamente!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                disabled={status === 'loading'}
                className="flex-1 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-3.5 text-sm text-ebony dark:text-white focus:outline-none focus:border-gold-400 transition-all placeholder:text-stone/40 dark:placeholder:text-white/20 disabled:opacity-50"
              />
              <Button type="submit" disabled={status === 'loading'} className="bg-gold-400 text-ebony hover:bg-gold-300 disabled:opacity-50 transition-all uppercase tracking-widest text-xs font-bold px-8 min-w-[140px]">
                {status === 'loading' ? 'Enviando...' : 'Suscribirme'}
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
    <section className="py-24 md:py-28 bg-ebony">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Testimonios</span>
          <h2 className="font-heading text-3xl md:text-5xl font-medium text-white tracking-wide">
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
                      <Star key={s} className="size-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-base md:text-lg text-silver/80 leading-relaxed mb-8 italic font-light">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-heading text-base font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gold-400/60 mt-1">{t.role}</p>
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
                  active === i ? 'bg-gold-400 w-6' : 'bg-white/20 hover:bg-white/40'
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
