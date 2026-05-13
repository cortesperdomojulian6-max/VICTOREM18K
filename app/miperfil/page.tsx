import { Suspense } from 'react'
import MiPerfilClient from './client'

export default async function MiPerfilPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <Suspense fallback={
      <div className="container-main py-20">
        <div className="animate-pulse max-w-3xl mx-auto space-y-4">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="h-64 bg-pearl/60" />
        </div>
      </div>
    }>
      <MiPerfilClient initialTab={searchParams?.tab as 'profile' | 'orders' | 'addresses' | undefined} />
    </Suspense>
  )
}
