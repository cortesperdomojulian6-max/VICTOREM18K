export type JewelType = 'pulsera' | 'anillo'

export type BalinType = 'liso' | 'diamantado'

export type BalinSize = 'small' | 'medium' | 'large'

export type MaterialName = 'gold' | 'silver' | 'rose' | 'black'

export interface BalinConfig {
  kind: 'balin'
  type: BalinType
  size: BalinSize
}

export interface NeoprenoConfig {
  kind: 'neopreno'
  color: string
  label: string
}

export interface DijonInSequenceConfig {
  kind: 'dijon'
  id: string
  label: string
  image: string
}

export type SequenceItem = BalinConfig | NeoprenoConfig | DijonInSequenceConfig

export interface DijonConfig {
  id: string
  label: string
  price: number
  image: string
}

export function getBeadImagePath(type: BalinType, _material?: MaterialName, _size?: BalinSize): string {
  return `/assets/optimized/balines/balin-${type}.webp`
}

export const BEAD_IMAGE_SIZES: Record<BalinSize, number> = {
  small: 40,
  medium: 60,
  large: 80,
}

export const DIJON_VIEW_SIZE = 50
export const NEOPRENO_VIEW_WIDTH = 32
export const NEOPRENO_VIEW_HEIGHT = 40

export const DIJONES: DijonConfig[] = [
  { id: 'infinito', label: 'Infinito', price: 18000, image: '/assets/optimized/dijones/dijon-infinito.webp' },
  { id: 'corazon', label: 'Corazón', price: 15000, image: '/assets/optimized/dijones/dijon-corazon.webp' },
  { id: 'cruz', label: 'Cruz', price: 15000, image: '/assets/optimized/dijones/dijon-cruz.webp' },
  { id: 'corona-grande', label: 'Corona Grande', price: 22000, image: '/assets/optimized/dijones/dijon-corona-grande.webp' },
  { id: 'corona-pequena-oval', label: 'Corona Oval', price: 18000, image: '/assets/optimized/dijones/dijon-corona-pequena-oval.webp' },
  { id: 'trebol', label: 'Trébol', price: 18000, image: '/assets/optimized/dijones/dijon-trebol.webp' },
  { id: 'herradura-caballo', label: 'Herradura', price: 20000, image: '/assets/optimized/dijones/dijon-herradura-caballo.webp' },
  { id: 'billete-dollar', label: 'Billete Dólar', price: 25000, image: '/assets/optimized/dijones/dijon-billete-dollar.webp' },
  { id: 'fe-grande', label: 'Fe Grande', price: 20000, image: '/assets/optimized/dijones/dijon-fe-grande.webp' },
  { id: 'fe-conector-pequeno', label: 'Fe (Conector)', price: 18000, image: '/assets/optimized/dijones/dijon-fe-conector-pequeno.webp' },
  { id: 'arcangel-san-miguel-dorado', label: 'San Miguel Arcángel', price: 28000, image: '/assets/optimized/dijones/dijon-arcangel-san-miguel-dorado.webp' },
  { id: 'arcangel-rose-gold', label: 'Arcángel Rose Gold', price: 28000, image: '/assets/optimized/dijones/dijon-arcangel-rose-gold.webp' },
  { id: 'san-benito-grande', label: 'San Benito Grande', price: 25000, image: '/assets/optimized/dijones/dijon-san-benito-grande.webp' },
  { id: 'san-jose', label: 'San José', price: 22000, image: '/assets/optimized/dijones/dijon-san-jose.webp' },
  { id: 'virgen-guadalupe', label: 'Virgen de Guadalupe', price: 25000, image: '/assets/optimized/dijones/dijon-virgen-guadalupe.webp' },
  { id: 'virgen-medalla', label: 'Virgen Medalla', price: 22000, image: '/assets/optimized/dijones/dijon-virgen-medalla.webp' },
]

export const COLORS: { name: MaterialName; label: string; value: string }[] = [
  { name: 'gold', label: 'Oro', value: '#d4af37' },
  { name: 'silver', label: 'Plata', value: '#c0c0c0' },
  { name: 'rose', label: 'Rosado', value: '#e8a0b4' },
  { name: 'black', label: 'Negro', value: '#1a1a1a' },
]

export const NEOPRENO_COLORS: { color: string; label: string; price: number; image: string }[] = [
  { color: '#1a1a1a', label: 'Negro', price: 2000, image: '/assets/optimized/neoprenos/neopreno-negro.webp' },
  { color: '#8B0000', label: 'Rojo', price: 2000, image: '/assets/optimized/neoprenos/neopreno-rojo.webp' },
  { color: '#000080', label: 'Azul', price: 2000, image: '/assets/optimized/neoprenos/neopreno-azul.webp' },
]

export function getNeoprenoImage(color: string): string | undefined {
  return NEOPRENO_COLORS.find(n => n.color === color)?.image
}

export const BASE_PRICES: Record<JewelType, number> = { pulsera: 80000, anillo: 50000 }

export const BALIN_PRICE = 5000
export const NEOPRENO_BASE_PRICE = 2000
export const DIJON_BASE_PRICE = 15000

export const STEPS = [
  { id: 1, label: 'Diseña tu Secuencia' },
  { id: 2, label: 'Producto' },
  { id: 3, label: 'Color' },
  { id: 4, label: 'Resumen' },
]

export function getMaterialFromColor(colorValue: string): MaterialName {
  const c = COLORS.find((c) => c.value === colorValue)
  return c?.name ?? 'gold'
}

export function getDijon(id: string): DijonConfig | undefined {
  return DIJONES.find((d) => d.id === id)
}

export function sequenceDescription(items: SequenceItem[]): string {
  const balines = items.filter(i => i.kind === 'balin').length
  const neoprenos = items.filter(i => i.kind === 'neopreno').length
  const dijones = items.filter(i => i.kind === 'dijon').length
  const liso = items.filter(i => i.kind === 'balin' && i.type === 'liso').length
  const diam = items.filter(i => i.kind === 'balin' && i.type === 'diamantado').length
  let desc = `${balines} Balines`
  if (liso > 0 && diam > 0) desc += ` (${liso} Lisos, ${diam} Diamantados)`
  else if (liso > 0) desc += ' Lisos'
  else desc += ' Diamantados'
  if (neoprenos > 0) desc += `, ${neoprenos} Neopreno(s)`
  if (dijones > 0) desc += `, ${dijones} Dijón(es)`
  return desc
}