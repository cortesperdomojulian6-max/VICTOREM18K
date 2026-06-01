import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { AuthModal } from '@/components/layout/auth-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { CursorTrail } from '@/components/ui/cursor-trail'
import { Toaster } from 'sonner'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

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
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JewelryStore',
      name: 'Victorem',
      description: 'Joyas artesanales en balinería con oro laminado 18K. Hechas a mano en Campoalegre, Huila.',
      url: 'https://victorem.co',
      logo: 'https://victorem.co/assets/images/logo.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle 20 #9-59',
        addressLocality: 'Campoalegre',
        addressRegion: 'Huila',
        addressCountry: 'CO',
      },
      telephone: '+57-310-787-5531',
      email: 'info@victorem.co',
      sameAs: [],
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    }),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${cormorant.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#0d0d0d" />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-gold-400 focus:text-ebony focus:font-semibold focus:text-sm focus:uppercase focus:tracking-wider"
        >
          Saltar al contenido
        </a>
        <ThemeProvider>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <AuthModal />
        <ScrollToTop />
        <CursorTrail />
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
