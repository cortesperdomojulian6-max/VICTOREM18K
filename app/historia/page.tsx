import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Nuestra Historia',
  description: 'Conoce la historia de Victorem y nuestra pasión por el arte ancestral de la balinería. Joyas artesanales hechas en Campoalegre, Huila.',
}

export default function HistoriaPage() {
  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Historia</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Nuestra Historia
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Conoce nuestra pasión por el arte ancestral de la balinería y cómo creamos joyas únicas en Campoalegre, Huila.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/assets/images/Historia.jpg"
                alt="Taller artesanal Victorem"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-medium text-primary">
                El arte de la balinería
              </h2>
              <div className="w-12 h-px bg-gold-400" />
              <div className="space-y-4 text-muted leading-relaxed text-sm">
                <p>
                  Victorem nace en Campoalegre, Huila, de la pasión por la joyería artesanal y el deseo de preservar una tradición que ha pasado de generación en generación.
                </p>
                <p>
                  La balinería es un arte que requiere paciencia, precisión y un profundo respeto por los materiales. Cada pieza es creada a mano, utilizando técnicas que combinan la tradición con un diseño contemporáneo.
                </p>
                <p>
                  Seleccionamos cuidadosamente cada balín, cada hilo y cada detalle para asegurar que cada joya sea única e irrepetible. Nuestro compromiso es con la calidad, la autenticidad y la belleza que perdura.
                </p>
                <p>
                  Creemos en el poder de las joyas para contar historias, para marcar momentos especiales y para acompañar a quienes las usan en su día a día. Cada pieza Victorem es una declaración de estilo, una conexión con la artesanía colombiana y una inversión en belleza atemporal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="container-main text-center">
          <h2 className="font-heading text-3xl font-medium text-primary mb-4">Misión</h2>
          <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Crear joyas artesanales de alta calidad que fusionen la tradición de la balinería con el diseño contemporáneo, ofreciendo a cada cliente una pieza única que refleje su personalidad y estilo.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main text-center">
          <h2 className="font-heading text-3xl font-medium text-primary mb-4">Visión</h2>
          <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Ser la marca de joyería artesanal colombiana más reconocida por su calidad, innovación y compromiso con la preservación de las técnicas tradicionales de balinería, llevando el arte de nuestras manos al mundo.
          </p>
        </div>
      </section>
    </>
  )
}
