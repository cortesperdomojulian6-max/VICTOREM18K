'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalkingTioRico } from '@/components/ui/walking-tio'
import { motion, useScroll, useTransform } from 'framer-motion'

const PRODUCTS = [
  { name: 'Pulsera Trébol', desc: 'Diseño artesanal con detalles en ónix y balinería fina de oro 18K.', price: '$ 165.000', img: 'https://lh3.googleusercontent.com/aida/ADBb0ui5-rz2jdv8Y_53OaYuZiv8WaX_MiMdloErKFkeDmMyySfIpTd00AL9LsjS9e1T4dV6ooVEWpK_OmEGA4M21Cn5dV4gUWjTI-UqQHZbs-lHKy9i4wns3A48zIZ0nYti5Dasd-iO4d0LakvH7wnVVtbE8cDJPPHTnH1peT-KJvwYT5Wl1ageRaBSaWHJttKrvmA6ERbSKDnkXEr1v21Gn21JusTBtJ2QqILz1MxlJJ0OGGXQHR0eZMrPqaM' },
  { name: 'Anillo Tres Carriles', desc: 'Elegancia estructurada con tres bandas de balines en oro de alta calidad.', price: '$ 180.000', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhxcUbRrCLheS4vc2Wzgr4I6B2A7mo90QDb788jg1olfnzdFUgf5-vaSgZDYy-6zXW1psTVd4-r_XAjjwuYsue-eujBnjanrvQ4YsP8bIrEsc8fI3soPTmz0MbEChw4SSZn5aZ728XwlNEbkr54kC46M5cuSlKoVMr9ZYBomb1039iYRv8K28Fc1kRhQofCSCDCaoj0W3QkejJ1VY9p5fME4mMMpHLDGkwlbwrz96Tpk1x0UYzZs-9gLZI' },
  { name: 'Diseño Exclusivo', desc: 'Pieza única tejida a mano con balines de oro y cordón de seda negro.', price: '$ 210.000', img: 'https://lh3.googleusercontent.com/aida/ADBb0uiGDW1x9ijKs71IwonjJJ5W0lgfPrEy0CQyE6P2_ozWBO_OkhtFvcj2tTsCr_2Vn26hxxJkffR8Tsy5PoBqFoVsDN_bD0asCTeRFZ3fgWwgi6S9DJbrVl5RJyxCDwKMjdRnhDgdgJWNjq7kn3vss14RoCdQ-jpZpBr0B-b8HYVdHodReQJk90id4DpgMz0JckR1y1xnysPjLSTkfoBRn-V0EC2Sldi-0eiM1N_6jHjZcvMdJedN5fesPg' },
  { name: 'Manilla Dollar', desc: 'Símbolo de sofisticación y estatus con placa central y balines labrados.', price: '$ 195.000', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhJGO4B-c-kKEzG6855LTP-6LUGXF7LU07OWlb__OMYxQyxy_y1qbHL9KiJACRgXW_t8RP-sNqD1q1sjYrVMTTbRhTQKNKWROoKhoFLgAr6aYi3zZfVAWXkANlTRiVaXkyyxg-Z3B8OT9eqyNBtBXsTDMgYmOLmQQdXNx1CuTmOohlTL4Ae1oItAMkhK5LMYT9DF5NcBctnO1xCwUS5bb8Ich_cJua6IdZFRGMcB3OfFON855fQ_aWG4OA' },
]

const TESTIMONIALS = [
  { text: 'La calidad es excepcional. Mi manilla personalizada es una obra de arte que uso todos los días. El proceso superó mis expectativas.', author: 'María González', location: 'Huila, Colombia' },
  { text: 'Compré un anillo para mi esposa y quedó encantada. La atención al detalle y la elegancia del diseño son incomparables.', author: 'Carlos Rodríguez', location: 'Bogotá, Colombia' },
  { text: 'El trabajo artesanal es impresionante. Cada balín está perfectamente colocado y el acabado en oro es hermoso. Inversión que vale la pena.', author: 'Ana Martínez', location: 'Medellín, Colombia' },
]

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ebony">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-ebony via-charcoal to-ebony" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: '-120%', y: 0 }}
          animate={{ x: ['-120%', '120%'] }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <WalkingTioRico />
          </div>
        </motion.div>
      </div>

      <motion.div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60 z-[2]" style={{ opacity }} />
      <motion.div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-snow to-transparent z-[2]" style={{ opacity }} />

      <div className="container-main relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="mx-auto mb-10">
            <Image
              src="/images/logo.png"
              alt="Victorem"
              width={180}
              height={180}
              className="mx-auto drop-shadow-[0_0_40px_rgba(212,175,55,0.3)]"
              priority
            />
          </div>
          <h1 className="font-heading text-5xl md:text-8xl font-light tracking-[0.2em] text-white mb-6">
            VICTOREM
          </h1>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto my-8" />
          <p className="font-heading text-xl md:text-2xl font-light tracking-[0.15em] text-gold-400 mb-6">
            Arte en cada balín, elegancia en cada detalle
          </p>
          <p className="text-sm md:text-base text-silver/60 max-w-xl mx-auto mb-12 font-light leading-relaxed tracking-wide">
            La perfecta fusión entre la maestría del tejido artesanal y la opulencia del oro laminado 18K.
            Creaciones únicas para quienes exigen distinción.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/catalogo">
              <Button size="lg" className="min-w-[220px] text-xs uppercase tracking-[0.2em] bg-gold-400 text-ebony hover:bg-gold-300 transition-all duration-500">
                Explorar Catálogo <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link href="/personalizacion">
              <Button variant="outline" size="lg" className="min-w-[220px] text-xs uppercase tracking-[0.2em] border-gold-400/30 text-gold-400 hover:bg-gold-400/10 transition-all duration-500">
                Crear Joya Única
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-[10px] uppercase tracking-[0.3em] text-silver">Descubra la Excelencia</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold-400 to-transparent" />
      </div>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('opacity-100', 'translate-y-0')
        })
      },
      { threshold: 0.1 },
    )
    document.querySelectorAll('.reveal-up').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <HeroSection />

      <section className="section-padding bg-snow dark:bg-ebony transition-colors duration-500">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Colección</span>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-ebony dark:text-white tracking-wide">
                Productos Destacados
              </h2>
            </div>
            <Link href="/catalogo" className="group flex items-center gap-4 text-sm text-stone dark:text-silver hover:text-gold-400 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider">Ver Todo</span>
              <div className="w-10 h-px bg-stone dark:bg-silver group-hover:bg-gold-400 transition-colors" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((product, i) => (
              <div
                key={i}
                className="group bg-white/5 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 p-6 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="aspect-[3/4] overflow-hidden mb-8 relative bg-stone-950">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-ebony text-[10px] uppercase font-bold tracking-widest hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all">
                      Saber Más
                    </button>
                  </div>
                </div>
                <h3 className="font-heading text-2xl font-medium text-gold-400 mb-2">{product.name}</h3>
                <p className="text-sm text-stone dark:text-silver mb-4 line-clamp-2 font-light">{product.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gold-400 font-bold text-xl">{product.price}</span>
                  <button className="text-stone dark:text-silver hover:text-gold-400 transition-colors">
                    <Star className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-ebony text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/textura.png')] opacity-10 pointer-events-none" />
        <div className="container-main relative z-10">
          <div className="text-center mb-16 reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Testimonios</span>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-white tracking-wide">
              La Voz de la Exclusividad
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 relative reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="absolute -top-6 left-10 size-12 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full flex items-center justify-center">
                  <Quote className="size-5 text-ebony" />
                </div>
                <div className="flex gap-1 text-gold-400 mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-gold-400" />
                  ))}
                </div>
                <p className="text-base italic mb-8 text-silver/80 leading-relaxed">"{t.text}"</p>
                <div className="flex flex-col">
                  <p className="font-heading font-semibold text-gold-400">{t.author}</p>
                  <p className="text-xs text-silver/60">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 px-4 reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]">
        <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-16 text-center border-t border-l border-white/10">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-gold-400 mb-4">
            Mantente Inspirado
          </h2>
          <p className="text-silver/70 mb-10 max-w-lg mx-auto">
            Recibe novedades, colecciones exclusivas y ofertas especiales directamente en tu correo.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 bg-white/5 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all placeholder:text-white/20"
            />
            <Button type="submit" className="bg-gold-400 text-ebony hover:bg-gold-300 transition-all uppercase tracking-widest text-xs font-bold">
              Suscribirme
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
