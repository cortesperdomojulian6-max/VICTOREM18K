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

export function getBeadSmallImagePath(type: BalinType): string {
  return `/assets/optimized/balines/balin-${type}-small.webp`
}

export function getBeadLargeImagePath(type: BalinType): string {
  return `/assets/optimized/balines/balin-${type}-large.webp`
}

const BEAD_DIAMETER = 40

export const BEAD_IMAGE_SIZES: Record<BalinSize, number> = {
  small: 28,
  medium: BEAD_DIAMETER,
  large: 52,
}

export const NEOPRENO_ASPECT = 1.0

export function getNeoprenoDisplaySize(beadSize: number) {
  return { width: Math.round(beadSize * NEOPRENO_ASPECT), height: beadSize }
}

export const DIJON_VIEW_SIZE = 60

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

export interface BalinVariant {
  size: string
  prices: {
    qty10: number
    qty50: number
    qty100: number
  }
}

export interface InsumoProduct {
  id: string
  name: string
  category: 'balin' | 'neopreno' | 'dije' | 'hilo' | 'tabla' | 'otro'
  image?: string
  retailPrice?: number
  wholesalePrice?: number
  wholesaleMinQty?: number
  unit: string
  colors?: string[]
  balinVariants?: BalinVariant[]
}

export const BALIN_LISO_VARIANTS: BalinVariant[] = [
  { size: '#3', prices: { qty10: 3300, qty50: 2900, qty100: 2400 } },
  { size: '#4', prices: { qty10: 4000, qty50: 3400, qty100: 3100 } },
  { size: '#5', prices: { qty10: 5500, qty50: 5100, qty100: 4600 } },
  { size: '#6', prices: { qty10: 7000, qty50: 7000, qty100: 6950 } },
  { size: '#8', prices: { qty10: 14000, qty50: 11000, qty100: 10800 } },
]

export const BALIN_DIAMANTADO_VARIANTS: BalinVariant[] = [
  { size: '#3', prices: { qty10: 5000, qty50: 4000, qty100: 3700 } },
  { size: '#4', prices: { qty10: 7000, qty50: 5600, qty100: 5200 } },
  { size: '#5', prices: { qty10: 8000, qty50: 7400, qty100: 7200 } },
  { size: '#6', prices: { qty10: 9500, qty50: 9400, qty100: 9200 } },
  { size: '#8', prices: { qty10: 13800, qty50: 13600, qty100: 13600 } },
]

export const INSUMOS: InsumoProduct[] = [
  { id: 'balin-liso', name: 'Balín Liso', category: 'balin', image: '/assets/optimized/balines/balin-liso-premium.webp', unit: 'unidad', balinVariants: BALIN_LISO_VARIANTS },
  { id: 'balin-diamantado', name: 'Balín Diamantado', category: 'balin', image: '/assets/optimized/balines/balin-diamantado-premium.webp', unit: 'unidad', balinVariants: BALIN_DIAMANTADO_VARIANTS },
  { id: 'neopreno-negro', name: 'Neopreno Negro', category: 'neopreno', image: '/assets/optimized/neoprenos/neopreno-negro.webp', retailPrice: 2000, wholesalePrice: 1200, wholesaleMinQty: 100, unit: 'unidad' },
  { id: 'neopreno-rojo', name: 'Neopreno Rojo', category: 'neopreno', image: '/assets/optimized/neoprenos/neopreno-rojo.webp', retailPrice: 2000, wholesalePrice: 1200, wholesaleMinQty: 100, unit: 'unidad' },
  { id: 'neopreno-azul', name: 'Neopreno Azul', category: 'neopreno', image: '/assets/optimized/neoprenos/neopreno-azul.webp', retailPrice: 2000, wholesalePrice: 1200, wholesaleMinQty: 100, unit: 'unidad' },
  { id: 'dije-infinito', name: 'Dije Infinito', category: 'dije', image: '/assets/optimized/dijones/dijon-infinito.webp', retailPrice: 18000, wholesalePrice: 12000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-corazon', name: 'Dije Corazón', category: 'dije', image: '/assets/optimized/dijones/dijon-corazon.webp', retailPrice: 15000, wholesalePrice: 10000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-cruz', name: 'Dije Cruz', category: 'dije', image: '/assets/optimized/dijones/dijon-cruz.webp', retailPrice: 15000, wholesalePrice: 10000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-corona-grande', name: 'Dije Corona Grande', category: 'dije', image: '/assets/optimized/dijones/dijon-corona-grande.webp', retailPrice: 22000, wholesalePrice: 15000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-corona-oval', name: 'Dije Corona Oval', category: 'dije', image: '/assets/optimized/dijones/dijon-corona-pequena-oval.webp', retailPrice: 18000, wholesalePrice: 12000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-trebol', name: 'Dije Trébol', category: 'dije', image: '/assets/optimized/dijones/dijon-trebol.webp', retailPrice: 18000, wholesalePrice: 12000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-herradura', name: 'Dije Herradura', category: 'dije', image: '/assets/optimized/dijones/dijon-herradura-caballo.webp', retailPrice: 20000, wholesalePrice: 14000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-billete', name: 'Dije Billete Dólar', category: 'dije', image: '/assets/optimized/dijones/dijon-billete-dollar.webp', retailPrice: 25000, wholesalePrice: 17000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-fe-grande', name: 'Dije Fe Grande', category: 'dije', image: '/assets/optimized/dijones/dijon-fe-grande.webp', retailPrice: 20000, wholesalePrice: 14000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-fe-conector', name: 'Dije Fe (Conector)', category: 'dije', image: '/assets/optimized/dijones/dijon-fe-conector-pequeno.webp', retailPrice: 18000, wholesalePrice: 12000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-arcangel-miguel', name: 'Dije San Miguel Arcángel', category: 'dije', image: '/assets/optimized/dijones/dijon-arcangel-san-miguel-dorado.webp', retailPrice: 28000, wholesalePrice: 20000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-arcangel-rose', name: 'Dije Arcángel Rose Gold', category: 'dije', image: '/assets/optimized/dijones/dijon-arcangel-rose-gold.webp', retailPrice: 28000, wholesalePrice: 20000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-san-benito', name: 'Dije San Benito Grande', category: 'dije', image: '/assets/optimized/dijones/dijon-san-benito-grande.webp', retailPrice: 25000, wholesalePrice: 17000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-san-jose', name: 'Dije San José', category: 'dije', image: '/assets/optimized/dijones/dijon-san-jose.webp', retailPrice: 22000, wholesalePrice: 15000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-virgen-guadalupe', name: 'Dije Virgen de Guadalupe', category: 'dije', image: '/assets/optimized/dijones/dijon-virgen-guadalupe.webp', retailPrice: 25000, wholesalePrice: 17000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'dije-virgen-medalla', name: 'Dije Virgen Medalla', category: 'dije', image: '/assets/optimized/dijones/dijon-virgen-medalla.webp', retailPrice: 22000, wholesalePrice: 15000, wholesaleMinQty: 10, unit: 'unidad' },
  { id: 'hilo-poliamida', name: 'Hilo Poliamida 0.5mm', category: 'hilo', image: '', retailPrice: 8000, wholesalePrice: 5500, wholesaleMinQty: 20, unit: 'rollo 10m', colors: ['#1a1a1a', '#d4af37', '#c0c0c0', '#ffffff', '#8B0000'] },
  { id: 'hilo-elastico', name: 'Hilo Elástico 0.8mm', category: 'hilo', image: '', retailPrice: 5000, wholesalePrice: 3500, wholesaleMinQty: 30, unit: 'rollo 5m', colors: ['#1a1a1a', '#ffffff', '#c0c0c0'] },
  { id: 'tabla-tejido', name: 'Tabla de Tejido', category: 'tabla', image: '', retailPrice: 25000, wholesalePrice: 18000, wholesaleMinQty: 5, unit: 'unidad' },
]

export const INSUMO_CATEGORIES = [
  { id: 'balin', label: 'Balines' },
  { id: 'neopreno', label: 'Neoprenos' },
  { id: 'dije', label: 'Dijes' },
  { id: 'hilo', label: 'Hilos' },
  { id: 'tabla', label: 'Tablas' },
]