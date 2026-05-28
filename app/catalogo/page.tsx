import { Suspense } from 'react'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import CatalogoContent from './CatalogoContent'

function CatalogoFallback() {
  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-white/80">Catálogo</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Nuestro Catálogo
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Explora nuestra colección de joyas artesanales en balinería, cada pieza está hecha a mano con oro laminado 18K.
          </p>
        </div>
      </div>
      <div className="container-main py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogoFallback />}>
      <CatalogoContent />
    </Suspense>
  )
}
