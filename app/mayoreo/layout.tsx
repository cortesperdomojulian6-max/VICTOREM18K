import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mayoreo e Insumos',
  description: 'Venta al por mayor de insumos para joyería artesanal. Balines, dijones, neoprenos y más para tus creaciones. Precios especiales por volumen.',
}

export default function MayoreoLayout({ children }: { children: React.ReactNode }) {
  return children
}
