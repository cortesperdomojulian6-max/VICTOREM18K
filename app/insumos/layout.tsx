import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insumos para Joyería',
  description: 'Balines de oro laminado 18K, neoprenos, dijes, hilos y tablas para profesionales y aficionados de la joyería artesanal. Precios al detal y al por mayor.',
}

export default function InsumosLayout({ children }: { children: React.ReactNode }) {
  return children
}
