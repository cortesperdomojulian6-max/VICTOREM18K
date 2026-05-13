import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Políticas y Privacidad',
  description: 'Políticas de privacidad, términos de uso y protección de datos de Victorem. Conoce cómo manejamos tu información personal y tus derechos como cliente.',
}

const SECTIONS = [
  {
    title: 'Política de Privacidad',
    content: [
      'En Victorem valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política describe cómo recopilamos, usamos y protegemos la información que nos proporcionas.',
      'Recopilamos información como tu nombre, correo electrónico, dirección y número de teléfono únicamente para procesar tus pedidos, mejorar nuestros servicios y comunicarnos contigo sobre tu compra.',
      'No compartimos tu información personal con terceros, excepto cuando sea necesario para procesar tu pedido (como plataformas de pago y servicios de envío) o cuando la ley lo requiera.',
      'Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación y entender cómo interactúas con nuestro sitio. Puedes configurar tu navegador para rechazar cookies si lo prefieres.',
      'Tus datos se almacenan de forma segura y solo se conservan durante el tiempo necesario para cumplir con los fines descritos en esta política. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos a info@victorem.co.',
      'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra accesos no autorizados, pérdida o alteración.',
    ],
  },
  {
    title: 'Términos y Condiciones',
    content: [
      'Al realizar una compra en Victorem, aceptas nuestros términos y condiciones. Todos los productos están sujetos a disponibilidad y nos reservamos el derecho de modificar precios sin previo aviso.',
      'Los precios mostrados incluyen IVA y están expresados en pesos colombianos (COP). El costo de envío se calcula según la ubicación de entrega y se muestra antes de finalizar la compra.',
      'Realizamos envíos a todo Colombia. Los tiempos de entrega varían según la ubicación y la disponibilidad del producto. Las joyas personalizadas pueden requerir tiempo adicional de elaboración.',
      'Ofrecemos garantía de satisfacción. Si no estás conforme con tu compra, contáctanos dentro de los primeros 5 días hábiles para evaluar el cambio o la devolución.',
    ],
  },
  {
    title: 'Política de Cookies',
    content: [
      'Este sitio web utiliza cookies propias y de terceros para mejorar tu experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido.',
      'Las cookies esenciales son necesarias para el funcionamiento básico del sitio. Las cookies de rendimiento nos ayudan a entender cómo los usuarios interactúan con nuestras páginas.',
      'Al continuar navegando en nuestro sitio, aceptas el uso de cookies de acuerdo con esta política. Puedes gestionar tus preferencias de cookies en la configuración de tu navegador.',
      'No utilizamos cookies para recopilar información personal sin tu consentimiento explícito.',
    ],
  },
  {
    title: 'Derechos y Responsabilidades',
    content: [
      'Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales en cualquier momento. Para ejercer estos derechos, escríbenos a info@victorem.co.',
      'Eres responsable de proporcionar información veraz y actualizada al realizar tus pedidos. Victorem no se hace responsable por problemas derivados de información incorrecta o desactualizada.',
      'Las imágenes de los productos son ilustrativas. Aunque nos esforzamos por mostrar los colores y detalles con precisión, puede haber ligeras variaciones debido a la naturaleza artesanal de nuestras piezas.',
      'Nos reservamos el derecho de actualizar estas políticas en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página.',
    ],
  },
]

export default function PoliticasPage() {
  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Políticas y Privacidad</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Políticas y Privacidad
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Transparencia y confianza son la base de nuestra relación con cada cliente.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-main max-w-4xl">
          <div className="space-y-16">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-2xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, i) => (
                    <p key={i} className="text-sm text-stone leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-cream border border-gold-400/20">
            <h3 className="font-heading text-lg font-medium text-ebony mb-3">
              Contacto para temas legales
            </h3>
            <p className="text-sm text-stone mb-1">
              Si tienes preguntas sobre nuestras políticas o deseas ejercer tus derechos de protección de datos, contáctanos:
            </p>
            <p className="text-sm text-ebony mt-3">
              <strong>Email:</strong> info@victorem.co
            </p>
            <p className="text-sm text-ebony">
              <strong>Dirección:</strong> Calle 20 #9-59, Campoalegre, Huila
            </p>
            <p className="text-sm text-ebony">
              <strong>Teléfono:</strong> +57 310 787 5531
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
