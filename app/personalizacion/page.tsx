'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ArrowRight, ArrowLeft, ShoppingBag, Sparkles, RefreshCcw, X, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Confetti } from '@/components/ui/confetti'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/types'

const RealisticJewelryViewer = dynamic(() => import('@/components/personalizacion/RealisticJewelryViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] relative rounded-xl overflow-hidden bg-gradient-to-b from-stone-100 to-white border border-pearl flex items-center justify-center">
      <div className="animate-spin rounded-full size-8 border-b-2 border-gold-400" />
    </div>
  )
})

type JewelType = 'pulsera' | 'anillo'
type DijeName = 'estrella' | 'corazon' | 'media-luna' | 'cruz' | 'mariposa' | 'hoja' | 'infinito' | 'aru'

interface Dije {
  name: DijeName
  label: string
  price: number
  image?: string
}

const DIJES: Dije[] = [
  { name: 'estrella', label: 'Estrella', price: 15000 },
  { name: 'corazon', label: 'Corazón', price: 15000 },
  { name: 'media-luna', label: 'Media Luna', price: 18000 },
  { name: 'cruz', label: 'Cruz', price: 15000 },
  { name: 'mariposa', label: 'Mariposa', price: 20000 },
  { name: 'hoja', label: 'Hoja', price: 18000 },
  { name: 'infinito', label: 'Infinito', price: 20000 },
  { name: 'aru', label: 'ARU', price: 25000, image: '/assets/images/dijes/van-cleef.jpg' },
]

const COLORS = [
  { name: 'gold', label: 'Oro', value: '#d4af37' },
  { name: 'silver', label: 'Plata', value: '#c0c0c0' },
  { name: 'rose', label: 'Rosado', value: '#e8a0b4' },
  { name: 'black', label: 'Negro', value: '#1a1a1a' },
]

const BASE_PRICES: Record<JewelType, number> = { pulsera: 80000, anillo: 50000 }
const BALIN_PRICE = 5000

const STEPS = [
  { id: 1, label: 'Tipo de Balín' },
  { id: 2, label: 'Producto' },
  { id: 3, label: 'Dije' },
  { id: 4, label: 'Color' },
  { id: 5, label: 'Resumen' },
]

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
            i < current ? 'bg-gold-400 text-ebony' :
            i === current ? 'bg-ebony text-white' :
            'bg-pearl text-stone'
          }`}>
            {i < current ? <Check className="size-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 transition-colors ${i < current ? 'bg-gold-400' : 'bg-pearl'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function PersonalizacionPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [jewelType, setJewelType] = useState<JewelType | null>(null)
  const [dije, setDije] = useState<DijeName | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [balines, setBalines] = useState<{ type: 'liso' | 'diamantado', size: 'small' | 'medium' | 'large' }[]>([])
  const [balinType, setBalinType] = useState<'lisos' | 'diamantados'>('lisos')
  const [showConfetti, setShowConfetti] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true)
      try {
        const data = await api.get<Product[]>('/products')
        setProducts(data)
      } catch {
        // Silently fail
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    const isBracelet = product.category?.toLowerCase() === 'pulsos' || product.category?.toLowerCase() === 'manillas'
    setJewelType(isBracelet ? 'pulsera' : 'anillo')
    setColor('#d4af37')
  }

  const handleResetProduct = () => {
    setSelectedProduct(null)
    setJewelType(null)
  }

  const updateBalin = (index: number, field: 'type' | 'size', value: any) => {
    const newBalines = [...balines]
    newBalines[index] = { ...newBalines[index], [field]: value }
    setBalines(newBalines)
  }

  const addBalin = () => {
    setBalines([...balines, { type: balinType === 'lisos' ? 'liso' : 'diamantado', size: 'medium' }])
  }

  const removeBalin = (index: number) => {
    setBalines(balines.filter((_, i) => i !== index))
  }

  const moveBalin = (index: number, direction: 'up' | 'down') => {
    const newBalines = [...balines]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newBalines.length) return
    const temp = newBalines[target]
    newBalines[target] = newBalines[index]
    newBalines[index] = temp
    setBalines(newBalines)
  }

  const basePrice = jewelType ? BASE_PRICES[jewelType] : 0
  const dijePrice = dije ? DIJES.find((d) => d.name === dije)?.price || 0 : 0
  const balinTotal = balines.length * BALIN_PRICE
  const total = basePrice + dijePrice + balinTotal

  const canProceed = () => {
    switch (step) {
      case 0: return balines.length > 0
      case 1: return jewelType !== null
      case 2: return dije !== null || step === 2 // Dije is optional? I'll let it be optional if the user wants.
      case 3: return color !== null
      case 4: return true
      default: return false
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuth'))
      return
    }

    const typeLabel = jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'

    try {
      const productList = await api.get<{ id: number; name: string }[]>('/products')
      const custom = productList.find((p) => p.name === 'Joya Personalizada' || p.name.toLowerCase().includes('personalizada'))
      if (!custom) { toast.error('Error: Producto personalizado no configurado'); return }

      await addItem(custom.id, 1)

      localStorage.setItem('personalizacion', JSON.stringify({
        type: jewelType, dije, color, balines, balinType, total,
        productoBase: selectedProduct?.name || null,
        fecha: new Date().toISOString(),
      }))

      setShowConfetti(true)
      toast.success(`${typeLabel} personalizada agregada al carrito`)
      setTimeout(() => router.push('/checkout'), 1200)
    } catch {
      toast.error('Error al agregar al carrito')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <RealisticJewelryViewer
                type={jewelType}
                dije={dije}
                color={color ? COLORS.find((c) => c.value === color)?.name || null : null}
                balines={balines}
                productName={selectedProduct?.name}
              />
            </div>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-2">Configura tu Secuencia de Balines</p>
                <p className="text-sm text-stone/60 font-light">Añade, elimina y personaliza cada balín para crear un diseño único.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {(['lisos', 'diamantados'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBalinType(t)}
                    className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                      balinType === t ? 'border-gold-400 bg-gold-400/10 text-gold-600 font-bold' : 'border-pearl text-stone hover:border-gold-400'
                    }`}
                  >
                    Tipo Predeterminado: {t === 'lisos' ? 'Lisos' : 'Diamantados'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto px-4 py-2 scrollbar-hide">
                {balines.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-pearl rounded-xl">
                    <p className="text-stone text-sm italic">No hay balines en la secuencia. Añade el primero.</p>
                  </div>
                )}
                {balines.map((b, i) => (
                  <div key={i} className="group relative bg-white border border-pearl p-4 rounded-xl transition-all hover:border-gold-400/50 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveBalin(i, 'up')}
                          disabled={i === 0}
                          className="p-1 rounded hover:bg-stone-100 text-stone hover:text-gold-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          onClick={() => moveBalin(i, 'down')}
                          disabled={i === balines.length - 1}
                          className="p-1 rounded hover:bg-stone-100 text-stone hover:text-gold-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-stone uppercase tracking-tighter">Balín #{i + 1}</span>
                      <button
                        onClick={() => removeBalin(i)}
                        className="p-1 rounded-full hover:bg-red-50 text-stone hover:text-red-500 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-semibold text-stone block">Estilo</label>
                        <select
                          value={b.type}
                          onChange={(e) => updateBalin(i, 'type', e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-pearl rounded-md outline-none focus:border-gold-400 transition-colors"
                        >
                          <option value="liso">Liso</option>
                          <option value="diamantado">Diamantado</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-semibold text-stone block">Tamaño</label>
                        <select
                          value={b.size}
                          onChange={(e) => updateBalin(i, 'size', e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-pearl rounded-md outline-none focus:border-gold-400 transition-colors"
                        >
                          <option value="small">Pequeño</option>
                          <option value="medium">Medio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addBalin}
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-pearl rounded-xl text-stone hover:border-gold-400 hover:text-gold-600 transition-all group"
                >
                  <Plus className="size-4 group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Añadir Balín</span>
                </button>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <RealisticJewelryViewer
                type={jewelType}
                dije={dije}
                color={color ? COLORS.find((c) => c.value === color)?.name || null : null}
                balines={balines}
                productName={selectedProduct?.name}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-6">Selecciona tu producto base del catálogo</p>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full size-8 border-b-2 border-gold-400" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => {
                      const imgUrl = product.image_url?.replace(/^imagenes\//, '/assets/images/') || null
                      const isSelected = selectedProduct?.id === product.id
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`p-3 border-2 text-center transition-all ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400/5 shadow-md ring-1 ring-gold-400/30'
                              : 'border-pearl hover:border-gold-300 bg-white'
                          }`}
                        >
                          <div className="aspect-square mb-2 flex items-center justify-center bg-stone-50 overflow-hidden">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={product.name} width={100} height={100} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Sparkles className="size-6 text-stone" />
                            )}
                          </div>
                          <span className="block text-xs font-medium text-ebony leading-tight line-clamp-2">{product.name}</span>
                          <span className="block text-[11px] text-stone mt-0.5">{formatPrice(Number(product.price))}</span>
                          {isSelected && (
                            <span className="block mt-1 text-[10px] text-gold-400 font-semibold">Seleccionado</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => { setJewelType('pulsera'); setColor('#d4af37') }}
                      className="text-xs text-stone hover:text-ebony underline underline-offset-2 transition-colors"
                    >
                      O empezar desde cero sin producto base
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <RealisticJewelryViewer
                type={jewelType}
                dije={dije}
                color={color ? COLORS.find((c) => c.value === color)?.name || null : null}
                balines={balines}
                productName={selectedProduct?.name}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-6">Elige tu dije favorito</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DIJES.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => setDije(d.name)}
                    className={`p-5 border-2 text-center transition-all ${
                      dije === d.name ? 'border-gold-400 bg-gold-400/5 shadow-md' : 'border-pearl hover:border-gold-400 bg-white'
                    }`}
                  >
                    <div className="size-12 mx-auto mb-2 flex items-center justify-center">
                      {d.image ? (
                        <Image src={d.image} alt={d.label} width={48} height={48} className="size-full object-contain" />
                      ) : (
                        <Sparkles className={`size-8 ${dije === d.name ? 'text-gold-400' : 'text-stone'}`} />
                      )}
                    </div>
                    <span className="block font-heading text-base font-medium text-ebony">{d.label}</span>
                    <span className="text-xs text-stone">+{formatPrice(d.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <RealisticJewelryViewer
                type={jewelType}
                dije={dije}
                color={color ? COLORS.find((c) => c.value === color)?.name || null : null}
                balines={balines}
                productName={selectedProduct?.name}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-6">Selecciona el color</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.value)}
                    className={`p-6 border-2 text-center transition-all ${
                      color === c.value ? 'border-gold-400 bg-gold-400/5 shadow-md' : 'border-pearl hover:border-gold-400 bg-white'
                    }`}
                  >
                    <div className="size-12 rounded-full mx-auto mb-3 border-2 border-white shadow-sm" style={{ backgroundColor: c.value }} />
                    <span className="block font-heading text-base font-medium text-ebony">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        const lisoCount = balines.filter(b => b.type === 'liso').length
        const diamCount = balines.filter(b => b.type === 'diamantado').length
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <RealisticJewelryViewer
                type={jewelType}
                dije={dije}
                color={color ? COLORS.find((c) => c.value === color)?.name || null : null}
                balines={balines}
                productName={selectedProduct?.name}
              />
            </div>
            <div className="bg-white p-8 border border-black/4">
              <h3 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                Resumen de tu joya personalizada
              </h3>
              <div className="space-y-4">
                {[
                  ['Producto base', selectedProduct?.name || `${jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'} personalizado`],
                  ['Dije', DIJES.find((d) => d.name === dije)?.label || 'Ninguno'],
                  ['Color', COLORS.find((c) => c.value === color)?.label || 'Oro'],
                  ['Composición', `${balines.length} Balines (${lisoCount} Lisos, ${diamCount} Diamantados)`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-stone">{label}</span>
                    <span className="font-medium text-ebony">{value}</span>
                  </div>
                ))}
                <hr className="border-pearl" />
                {[
                  [`Base (${jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'})`, formatPrice(basePrice)],
                  ...(dije ? [[`Dije (${DIJES.find((d) => d.name === dije)?.label})`, `+${formatPrice(dijePrice)}`]] : []),
                  [`Balines (${balines.length})`, `+${formatPrice(balinTotal)}`],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-stone">{label as string}</span>
                    <span className="font-medium text-ebony">{value as string}</span>
                  </div>
                ))}
                <hr className="border-pearl" />
                <div className="flex justify-between font-heading text-xl font-semibold text-gold-400">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                  <ShoppingBag className="size-4 mr-2" /> Agregar al Carrito
                </Button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Personaliza tu Joya</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Personaliza tu Joya
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Crea una pieza única que refleje tu estilo. Elige cada detalle y recibe una joya hecha exclusivamente para ti.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <StepIndicator current={step} total={STEPS.length} />

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="size-4 mr-2" /> Anterior
              </Button>
            ) : <div />}
            {step < 4 ? (
              <Button disabled={!canProceed()} onClick={() => setStep(step + 1)}>
                Continuar <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
