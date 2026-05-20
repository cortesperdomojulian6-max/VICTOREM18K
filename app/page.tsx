'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-obsidian pt-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-400 opacity-[0.05] blur-[150px] rounded-full" />

        <div className="absolute top-[25%] left-[25%] size-[15px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" />
        <div className="absolute top-[70%] left-[75%] size-[25px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-8s' }} />
        <div className="absolute top-[45%] left-[85%] size-[12px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-12s' }} />
        <div className="absolute top-[15%] left-[60%] size-[20px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[40%] left-[15%] size-[18px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-2s', opacity: 0.6 }} />
        <div className="absolute top-[80%] left-[30%] size-[10px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-6s', opacity: 0.4 }} />
        <div className="absolute top-[20%] left-[80%] size-[14px] bg-gold-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-float-orb" style={{ animationDelay: '-10s', opacity: 0.5 }} />

        <div className="absolute bottom-[5%] left-[2%] w-[280px] z-30 pointer-events-none hidden lg:block scale-90">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvr6aGbzd5XvA6oBxXlZfzDnOan6HDmO9C9ompI8xfA_IvObrGp4e1NEEt1WKohDbq2539Lu-FRa62UjEHpVZX2SmM1LgKsPl03U6gGwKqYnbpfQ9HPs15v3I_080cYBxgixPMO7gX8VSF36BTwjtlT6YebV_lNMAMIeRkNcA_MWHNJgHoPnvYqJivL7fEqqrpcF5K5nXOhg2eoGNpy2-0vSZFFtG6FTZ3SMq5dJIoQq2yszjjd66fhj5JSl9MtThocZX5Bz5SQuM"
            alt="Scrooge McDuck Mascot"
            className="w-full h-auto animate-mascot"
            style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4)) brightness(1.1)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl px-4">
          <div className="mb-8 flex flex-col items-center animate-logo-pulse">
            <Image
              src="/images/logo.png"
              alt="Victorem"
              width={160}
              height={160}
              className="size-32 md:size-40 object-contain mb-4 drop-shadow-xl"
              priority
            />
          </div>

          <h1 className="font-heading text-4xl md:text-7xl font-light tracking-[0.15em] text-white mb-6 reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]">
            Arte en cada balín,<br />
            <span className="text-gold-400 italic">elegancia en cada detalle</span>
          </h1>

          <p className="text-base md:text-lg text-silver/70 max-w-2xl mx-auto mb-12 reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s] delay-200">
            La perfecta fusión entre tradición artesanal y diseño contemporáneo en cada una de nuestras creaciones únicas.
            Joyas en oro laminado 18K de la más alta distinción.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s] delay-300">
            <Link href="/catalogo">
              <Button size="lg" className="min-w-[220px] text-sm tracking-[0.15em]">
                Explorar Catálogo <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link href="/personalizacion">
              <Button variant="outline" size="lg" className="min-w-[220px] text-sm tracking-[0.15em]">
                Crear Joya Única
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] uppercase tracking-[0.3em] text-silver">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold-400 to-transparent" />
        </div>
      </header>

      <section className="py-24 md:py-40 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Colección</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-ebony dark:text-white tracking-wide">
              Productos Destacados
            </h2>
          </div>
          <Link href="/catalogo" className="group flex items-center gap-4 text-sm text-stone hover:text-gold-400 transition-colors">
            <span className="text-xs font-semibold uppercase tracking-wider">Ver Todo</span>
            <div className="w-10 h-px bg-stone group-hover:bg-gold-400 transition-colors" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {PRODUCTS.map((product, i) => (
            <div
              key={i}
              className="group bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]"
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
                    Agregar
                  </button>
                </div>
              </div>
              <h3 className="font-heading text-xl font-medium text-gold-400 mb-2">{product.name}</h3>
              <p className="text-sm text-stone mb-4 line-clamp-2">{product.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-gold-400 font-bold text-lg">{product.price}</span>
                <button className="text-stone hover:text-gold-400 transition-colors">
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-950 dark:bg-stone-950 py-24 md:py-40 overflow-hidden">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-up opacity-0 translate-y-8 transition-all duration-[0.8s]">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.15em] block mb-3">Testimonios</span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-white tracking-wide">
              Lo que dicen nuestros clientes
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
                <div>
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
            <Button type="submit">
              Suscribirme
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
