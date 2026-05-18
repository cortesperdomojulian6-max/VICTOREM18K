'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-ebony">
        <div className="text-center max-w-md mx-auto px-6">
          <span className="font-heading text-7xl font-light text-gold-400 block mb-4">:(</span>
          <h1 className="font-heading text-2xl font-medium text-white mb-3">Error crítico</h1>
          <p className="text-sm text-silver mb-8 leading-relaxed">
            Ocurrió un error inesperado. Recarga la página para continuar.
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 bg-gold-400 text-ebony font-semibold uppercase tracking-[0.12em] text-[0.6875rem] hover:bg-gold-500 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </body>
    </html>
  )
}
