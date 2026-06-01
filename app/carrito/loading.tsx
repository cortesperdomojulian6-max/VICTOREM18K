import { Skeleton } from '@/components/ui/skeleton'

export default function CarritoLoading() {
  return (
    <div className="container-main py-10">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-elevated border border-subtle">
            <Skeleton className="size-24 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="size-9 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
