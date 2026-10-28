import type { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { AuthModal } from '@/components/layout/auth-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { CursorTrail } from '@/components/ui/cursor-trail'
import { Toaster } from 'sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VICTOREM - PRUEBA DE FUEGO',
    template: '%s | Victorem',
  },
  description:
    'Arte en cada balín, elegancia en cada detalle. Joyas artesanales en balinería con oro laminado 18K.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${playfair.variable} ${montserrat.variable}`}>
      <head>
        <meta name="theme-color" content="#fff8f0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="bg-red-600 text-white text-center py-3 font-black uppercase tracking-tighter text-lg z-[1000] relative">
          🚨 SISTEMA V3 - PRUEBA FINAL 2026 🚨
        </div>
        <ThemeProvider>
          <Header />
          <main id="main-content" className="flex-1 pt-16 md:pt-20">{children}</main>
          <Footer />
        </ThemeProvider>
        <AuthModal />
        <ScrollToTop />
        <CursorTrail />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}