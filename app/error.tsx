'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="container-main py-20 text-center">
      <div className="max-w-md mx-auto">
        <span className="font-heading text-7xl font-light text-gold-400 block mb-4">:(</span>
        <h1 className="font-heading text-2xl font-medium text-ebony mb-3">Algo salió mal</h1>
        <p className="text-sm text-stone mb-8 leading-relaxed">
          Ocurrió un error inesperado. Ya lo registramos y lo solucionaremos pronto.
        </p>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </div>
  )
}
