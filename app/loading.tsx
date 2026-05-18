import { Loader } from '@/components/ui/loader'

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" />
    </div>
  )
}
