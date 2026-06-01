import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de Victorem. Conoce las condiciones de compra, garantías, propiedad intelectual y limitaciones de responsabilidad.',
}

const SECTIONS = [
  {
    title: 'Aceptación de los Términos',
    content:
      'Al acceder y utilizar este sitio web, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, te recomendamos no utilizar nuestros servicios.',
  },
  {
    title: 'Uso del Sitio',
    content:
      'Este sitio web está destinado a la compra de joyas artesanales y la navegación informativa. No debes utilizar este sitio para fines ilegales o no autorizados. Te comprometes a no interferir con la seguridad o el funcionamiento del sitio.',
  },
  {
    title: 'Productos y Precios',
    content:
      'Todos nuestros productos son hechos a mano, por lo que pueden presentar ligeras variaciones en comparación con las imágenes mostradas. Nos esforzamos por garantizar que los precios y descripciones sean precisos, pero nos reservamos el derecho de corregir errores.',
  },
  {
    title: 'Proceso de Compra',
    content:
      'Al realizar un pedido, te comprometes a proporcionar información veraz y completa. Una vez realizado el pago, recibirás una confirmación por correo electrónico. Nos reservamos el derecho de cancelar pedidos si detectamos irregularidades.',
  },
  {
    title: 'Garantías',
    content:
      'Ofrecemos garantía sobre la calidad artesanal de nuestras joyas. Si tu pieza presenta defectos de fabricación dentro de los primeros 30 días, contáctanos para evaluar el caso. La garantía no cubre el desgaste normal, mal uso o daños accidentales.',
  },
  {
    title: 'Propiedad Intelectual',
    content:
      'Todos los contenidos de este sitio web, incluyendo imágenes, textos, logotipos y diseños, son propiedad de Victorem o utilizados con licencia. Queda prohibida la reproducción total o parcial sin autorización expresa.',
  },
  {
    title: 'Limitación de Responsabilidad',
    content:
      'Victorem no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios. Nuestra responsabilidad máxima se limita al valor del producto adquirido.',
  },
  {
    title: 'Ley Aplicable',
    content:
      'Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa relacionada con estos términos será sometida a la jurisdicción de los tribunales de Campoalegre, Huila.',
  },
]

export default function TerminosPage() {
  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Términos y Condiciones</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Al utilizar nuestro sitio web y realizar una compra, aceptas los siguientes términos y condiciones.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-main max-w-4xl">
          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-2xl font-medium text-primary mb-4 pb-3 border-b border-gold-400/30">
                  {section.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-cream border border-gold-400/20">
            <p className="text-sm text-muted">
              Última actualización: Enero 2026. Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
