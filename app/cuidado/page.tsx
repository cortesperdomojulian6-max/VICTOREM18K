import type { Metadata } from 'next'
import { Sparkles, Droplets, Sun, Shield, Wrench, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cuidado de Joyas',
  description: 'Aprende cómo cuidar y mantener tus joyas artesanales Victorem. Consejos para preservar la belleza del oro laminado 18K y la balinería.',
}

const TIPS = [
  {
    icon: Sparkles,
    title: 'Limpieza Regular',
    description:
      'Limpia tus joyas con un paño suave y seco después de cada uso. Para una limpieza más profunda, usa un paño ligeramente humedecido con agua tibia y jabón neutro. Evita productos químicos agresivos.',
  },
  {
    icon: Droplets,
    title: 'Evita el Agua',
    description:
      'Quita tus joyas antes de ducharte, nadar o realizar actividades acuáticas. El cloro, el agua salada y la humedad prolongada pueden afectar el brillo del oro laminado y la integridad de los balines.',
  },
  {
    icon: Sun,
    title: 'Almacenamiento',
    description:
      'Guarda tus joyas en un lugar seco y fresco, lejos de la luz solar directa. Usa la bolsa de tela que incluimos con cada compra o un joyero forrado en tela suave para evitar rayones.',
  },
  {
    icon: Shield,
    title: 'Precauciones',
    description:
      'Evita el contacto con perfumes, cremas, lociones y productos de limpieza. Aplica estos productos antes de ponerte tus joyas y espera a que se sequen completamente.',
  },
  {
    icon: Wrench,
    title: 'Mantenimiento Profesional',
    description:
      'Recomendamos una revisión profesional cada 6 meses. Podemos verificar el estado de los balines, la tensión del hilo y realizar una limpieza profunda para mantener tu joya como nueva.',
  },
  {
    icon: Search,
    title: 'Inspección Periódica',
    description:
      'Revisa regularmente el estado de tus joyas. Si notas algún balín flojo, el hilo desgastado o algún daño, contáctanos inmediatamente para evitar la pérdida de piezas.',
  },
]

export default function CuidadoPage() {
  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Cuidado de Joyas</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Cuidado de tus Joyas
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            El oro laminado 18K es duradero, pero no indestructible. Con los cuidados adecuados, tus joyas Victorem mantendrán su brillo y belleza por años.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm text-stone leading-relaxed">
              Cada pieza Victorem es creada con dedicación y los mejores materiales. Para preservar su belleza y garantizar su durabilidad, te compartimos estas recomendaciones esenciales de cuidado y mantenimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TIPS.map((tip, i) => (
              <div
                key={tip.title}
                className="bg-white p-8 border border-black/4 hover:border-gold-400/25 hover:shadow-md transition-all duration-300 group"
              >
                <div className="size-12 flex items-center justify-center bg-cream mb-5 group-hover:bg-gold-400/10 transition-colors">
                  <tip.icon className="size-6 text-gold-400" />
                </div>
                <h3 className="font-heading text-lg font-medium text-ebony mb-3">
                  {tip.title}
                </h3>
                <p className="text-sm text-stone leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-cream border border-gold-400/20 text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-xl font-medium text-ebony mb-3">
              ¿Necesitas una revisión?
            </h2>
            <p className="text-sm text-stone mb-5">
              Si tu joya necesita mantenimiento o reparación, contáctanos y con gusto la revisaremos. Ofrecemos servicio de mantenimiento para todas nuestras piezas.
            </p>
            <a
              href="/contacto"
              className="inline-flex px-8 py-3 bg-ebony text-white text-xs font-semibold uppercase tracking-[0.12em] hover:bg-gold-400 hover:text-ebony transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
