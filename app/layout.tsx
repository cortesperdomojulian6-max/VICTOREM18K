import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthModal } from '@/components/layout/auth-modal'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'Victorem - Joyas Artesanales en Balinería',
    template: '%s | Victorem',
  },
  description:
    'Arte en cada balín, elegancia en cada detalle. Joyas artesanales en balinería con oro laminado 18K. Hechas a mano en Campoalegre, Huila.',
  metadataBase: new URL('https://victorem.co'),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Victorem',
    images: [{ url: '/images/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0d0d0d" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AuthModal />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d0d0d',
              color: '#fff',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  )
}
