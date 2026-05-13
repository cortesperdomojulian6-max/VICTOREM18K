import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-ebony">
      <div className="container-main text-center">
        <p className="font-heading text-[10rem] md:text-[14rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-gold-700 select-none">
          404
        </p>
        <h1 className="font-heading text-2xl md:text-3xl font-medium text-white mt-4 mb-3">
          Página no encontrada
        </h1>
        <p className="text-sm text-silver max-w-md mx-auto mb-10">
          La página que buscas no existe o ha sido movida. Te invitamos a explorar nuestro catálogo o contactarnos si necesitas ayuda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/catalogo"
            className="inline-flex px-8 py-3 bg-gold-400 text-ebony text-xs font-semibold uppercase tracking-[0.12em] hover:bg-gold-500 transition-colors"
          >
            Explorar Catálogo
          </Link>
          <Link
            href="/personalizacion"
            className="inline-flex px-8 py-3 border border-gold-400 text-gold-400 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-gold-400 hover:text-ebony transition-colors"
          >
            Crear Joya Única
          </Link>
        </div>
      </div>
    </div>
  )
}
