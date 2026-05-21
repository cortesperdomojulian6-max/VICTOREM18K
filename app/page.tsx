'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-gold-400/5 animate-pulse-slow pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-gold-400/10 animate-pulse-slower pointer-events-none" />
      </div>

      <motion.div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/50 z-[2]" style={{ opacity }} />

      <div className="container-main relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="mx-auto mb-8">
            <Image
              src="/images/logo.png"
              alt="Victorem"
              width={140}
              height={140}
              className="mx-auto drop-shadow-[0_0_50px_rgba(212,175,55,0.25)]"
              priority
            />
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mb-8 origin-center"
          />

          <h1 className="font-heading text-5xl md:text-8xl font-light tracking-[0.15em] text-white mb-6 leading-none">
            DONDE EL ORO
            <br />
            <span className="text-gold-400">ENCUENTRA SU FORMA</span>
          </h1>

          <p className="text-sm md:text-base text-silver/50 max-w-lg mx-auto mb-12 font-light leading-relaxed tracking-wider">
            Artesanía en balinería de oro laminado 18K. Piezas únicas tejidas a mano para quienes entienden la diferencia entre un accesorio y una declaración.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/catalogo">
              <Button size="lg" className="min-w-[200px] text-xs uppercase tracking-[0.2em] bg-gold-400 text-ebony hover:bg-gold-300 transition-all duration-500 group">
                Colección <ArrowRight className="size-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/personalizacion">
              <Button variant="outline" size="lg" className="min-w-[200px] text-xs uppercase tracking-[0.2em] border-gold-400/30 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400/60 transition-all duration-500">
                Crear tu Joya
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25">
        <span className="text-[10px] uppercase tracking-[0.3em] text-silver">Descubre</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-gold-400 to-transparent"
        />
      </div>
    </section>
  )
}

function CraftsmanshipSection() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-ebony">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/5 to-transparent pointer-events-none" />
      <div className="container-main relative z-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-4">Artesanía</span>
            <h2 className="font-heading text-3xl md:text-5xl font-light text-white tracking-wide mb-8 leading-tight">
              El Arte del<br />
              <span className="text-gold-400">Balín Perfecto</span>
            </h2>
            <div className="space-y-5 text-silver/60 text-sm leading-relaxed">
              <p>
                Cada pieza Victorem nace de la paciencia y la precisión. Nuestros maestros artesanos seleccionan, alinean y tejen cada balín de oro laminado 18K uno por uno, creando patrones que fluyen con la luz.
              </p>
              <p>
                No producimos en masa. Cada joya es un diálogo entre el diseñador y el material, un proceso que puede tomar días para una sola pieza. Porque la belleza verdadera no se fabrica — se construye, eslabón por eslabón.
              </p>
            </div>
            <Link href="/historia">
              <Button variant="ghost" className="mt-8 text-gold-400 hover:text-gold-300 text-xs uppercase tracking-widest group">
                Conoce Nuestra Historia <ArrowRight className="size-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square md:aspect-[4/5] bg-stone-950/80 border border-white/5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <Image
                src="https://lh3.googleusercontent.com/aida/ADBb0uhJGO4B-c-kKEzG6855LTP-6LUGXF7LU07OWlb__OMYxQyxy_y1qbHL9KiJACRgXW_t8RP-sNqD1q1sjYrVMTTbRhTQKNKWROoKhoFLgAr6aYi3zZfVAWXkANlTRiVaXkyyxg-Z3B8OT9eqyNBtBXsTDMgYmOLmQQdXNx1CuTmOohlTL4Ae1oItAMkhK5LMYT9DF5NcBctnO1xCwUS5bb8Ich_cJua6IdZFRGMcB3OfFON855fQ_aWG4OA"
                alt="Craftsmanship"
                width={400}
                height={500}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ebony to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ProductsSection() {
  return (
    <section className="py-20 md:py-28 bg-snow dark:bg-ebony transition-colors duration-500">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em] block mb-3">Colección</span>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-ebony dark:text-white tracking-wide">
              Piezas Destacadas
            </h2>
          </div>
          <Link href="/catalogo" className="group flex items-center gap-3 text-sm text-stone dark:text-silver hover:text-gold-400 transition-colors">
            <span className="text-xs font-semibold uppercase tracking-wider">Ver Todo</span>
            <div className="w-8 h-px bg-stone dark:bg-silver group-hover:bg-gold-400 group-hover:w-12 transition-all" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]"
            >
              <Link href="/catalogo">
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-950">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
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
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/catalogo">
            <Button variant="outline" className="text-xs uppercase tracking-[0.2em] border-stone/30 text-stone hover:border-gold-400 hover:text-gold-400 transition-all">
              Explorar Catálogo Completo <ArrowRight className="size-3.5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-ebony">
      <div className="absolute inset-0 bg-[url('/images/textura.png')] opacity-5 pointer-events-none" />
      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Testimonios</span>
          <h2 className="font-heading text-3xl md:text-5xl font-medium text-white tracking-wide">
            Clientes Exigentes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 relative"
            >
              <div className="flex gap-1 text-gold-400 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-gold-400" />
                ))}
              </div>
              <p className="text-sm text-silver/70 mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="pt-4 border-t border-white/5">
                <p className="font-heading font-semibold text-gold-400 text-sm">{t.author}</p>
                <p className="text-xs text-silver/40 mt-0.5">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  return (
    <section className="relative py-24 md:py-28 overflow-hidden bg-snow dark:bg-ebony">
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
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-3.5 text-sm text-ebony dark:text-white focus:outline-none focus:border-gold-400 transition-all placeholder:text-stone/40 dark:placeholder:text-white/20"
            />
            <Button type="submit" className="bg-gold-400 text-ebony hover:bg-gold-300 transition-all uppercase tracking-widest text-xs font-bold px-8">
              Suscribirme
            </Button>
          </form>
        </motion.div>
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
      <NewsletterSection />
    </>
  )
}
