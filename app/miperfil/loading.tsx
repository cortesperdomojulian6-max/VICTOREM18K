import { Skeleton } from '@/components/ui/skeleton'

export default function MiPerfilLoading() {
  return (
    <div className="container-main py-10">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="flex gap-1 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
