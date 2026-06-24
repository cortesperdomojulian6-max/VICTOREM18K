import Link from 'next/link'
import { CONTACT } from '@/lib/config'

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
    <footer className="bg-ebony text-white border-t border-white/5">
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          <div className="col-span-2 md:col-span-1 space-y-5">
            <h3 className="font-heading text-2xl font-medium tracking-wide text-gold-400">
              Victorem
            </h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Arte en cada balín, elegancia en cada detalle. Joyas artesanales en balinería con oro laminado 18K, hechas a mano en Campoalegre, Huila.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">
              Explorar
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">
              Información
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="block text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Ubicación</span>
                <span className="text-white/60">{CONTACT.address}</span>
              </li>
              <li>
                <span className="block text-white/30 text-[10px] uppercase tracking-wider mb-0.5">WhatsApp</span>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <span className="block text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Email</span>
                <a href={`mailto:${CONTACT.email}`} className="text-white/60 hover:text-gold-400 transition-colors">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Victorem. Hecho a mano en Colombia.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-[10px] font-semibold tracking-wider bg-white/5 text-white/30 border border-white/5">
              NEQUI
            </span>
            <span className="px-3 py-1 text-[10px] font-semibold tracking-wider bg-white/5 text-white/30 border border-white/5">
              WOMPI
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

