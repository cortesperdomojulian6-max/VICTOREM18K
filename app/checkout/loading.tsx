import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="bg-ebony/90">
      <div className="container-main py-14 md:py-20">
        <Skeleton className="h-4 w-32 bg-white/10 animate-pulse mb-6" />
        <Skeleton className="h-10 w-48 bg-white/10 animate-pulse" />
      </div>
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
