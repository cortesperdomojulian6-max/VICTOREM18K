import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/personalizacion', label: 'Personalizar' },
  { href: '/historia', label: 'Nuestra Historia' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/cuidado', label: 'Cuidado de Joyas' },
  { href: '/politicas', label: 'Políticas y Privacidad' },
  { href: '/terminos', label: 'Términos y Condiciones' },
] as const

export function Footer() {
  return (
    <footer className="bg-ebony text-white border-t border-gold-400/10">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-medium tracking-wide text-gold-400">
              VICTOREM
            </h3>
            <p className="text-sm text-silver leading-relaxed">
              Arte en cada balín, elegancia en cada detalle. Joyas artesanales en balinería con oro laminado 18K, hechas a mano en Campoalegre, Huila.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400 mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-silver hover:text-gold-400 transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400 mb-4">
              Ayuda
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-silver hover:text-gold-400 transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400 mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-silver">
              <li>
                <span className="block text-white/60 text-xs uppercase tracking-wider mb-0.5">Dirección</span>
                Calle 20 #9-59, Campoalegre, Huila
              </li>
              <li>
                <span className="block text-white/60 text-xs uppercase tracking-wider mb-0.5">Teléfono</span>
                +57 310 787 5531
              </li>
              <li>
                <span className="block text-white/60 text-xs uppercase tracking-wider mb-0.5">Email</span>
                info@victorem.co
              </li>
              <li>
                <span className="block text-white/60 text-xs uppercase tracking-wider mb-0.5">Horario</span>
                Lun - Sáb: 9:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {['NEQUI'].map((method) => (
              <span key={method} className="px-3 py-1.5 text-[0.625rem] font-semibold tracking-wider bg-white/5 text-silver border border-white/5">
                {method}
              </span>
            ))}
          </div>
          <p className="text-xs text-silver/60">
            © {new Date().getFullYear()} Victorem. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
