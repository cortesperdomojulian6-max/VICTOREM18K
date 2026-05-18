import { ProductCardSkeleton } from '@/components/ui/skeleton'

export default function CatalogoLoading() {
  return (
    <div className="bg-ebony/90">
      <div className="container-main py-14 md:py-20">
        <div className="h-4 w-32 bg-white/10 animate-pulse mb-6" />
        <div className="h-10 w-64 bg-white/10 animate-pulse" />
        <div className="h-4 w-96 bg-white/10 animate-pulse mt-3" />
      </div>
      <div className="container-main py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (<ProductCardSkeleton key={i} />))}
        </div>
      </div>
    </div>
  )
}
