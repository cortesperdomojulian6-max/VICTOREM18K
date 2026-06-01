'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Check, ArrowRight, ArrowLeft, ShoppingBag, Sparkles, Plus, X, GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatPrice, productImageUrl } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Confetti } from '@/components/ui/confetti'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import BeadSequenceViewer from '@/components/personalizacion/BeadSequenceViewer'
import ChatAssistant from '@/components/personalizacion/ChatAssistant'
import {
  DIJONES, COLORS, NEOPRENO_COLORS,
  BASE_PRICES, BALIN_PRICE, NEOPRENO_BASE_PRICE, DIJON_BASE_PRICE,
  STEPS, getMaterialFromColor, getDijon, getNeoprenoImage, sequenceDescription,
} from '@/lib/personalizacion'
import type { JewelType, MaterialName, SequenceItem, BalinType, BalinSize, DijonConfig } from '@/lib/personalizacion'
import type { Product } from '@/types'

export default function PersonalizacionPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [jewelType, setJewelType] = useState<JewelType | null>(null)
  const [color, setColor] = useState<string>('#d4af37')
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [defaultBalinType, setDefaultBalinType] = useState<BalinType>('liso')
  const [showConfetti, setShowConfetti] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [showDijeGrid, setShowDijeGrid] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const [description, setDescription] = useState<string | null>(null)
  const [descLoading, setDescLoading] = useState(false)
  const descFetched = useRef(false)

  const material: MaterialName = getMaterialFromColor(color)

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true)
      try {
        const data = await api.get<Product[]>('/products')
        setProducts(data)
      } catch {
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

  const addBalin = useCallback(() => {
    setSequence((prev) => [...prev, { kind: 'balin', type: defaultBalinType, size: 'medium' }])
  }, [defaultBalinType])

  const addNeopreno = useCallback((color: string, label: string) => {
    setSequence((prev) => [...prev, { kind: 'neopreno', color, label }])
  }, [])

  const addDijon = useCallback((id: string) => {
    const d = getDijon(id)
    if (!d) return
    setSequence((prev) => [...prev, { kind: 'dijon', id: d.id, label: d.label, image: d.image }])
    setShowDijeGrid(false)
  }, [])

  const removeItem = useCallback((index: number) => {
    setSequence((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const moveItem = useCallback((from: number, to: number) => {
    if (to < 0 || to >= sequence.length) return
    setSequence((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }, [sequence.length])

  const updateBalin = useCallback((index: number, field: 'type' | 'size', value: string) => {
    setSequence((prev) => {
      const next = [...prev]
      const item = next[index]
      if (item.kind === 'balin') {
        next[index] = { ...item, [field]: value }
      }
      return next
    })
  }, [])

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    moveItem(dragIndex, index)
    setDragIndex(index)
  }
  const handleDragEnd = () => setDragIndex(null)

  const basePrice = jewelType ? BASE_PRICES[jewelType] : 0
  const balinTotal = sequence.filter((s) => s.kind === 'balin').length * BALIN_PRICE
  const neoprenoTotal = sequence.filter((s) => s.kind === 'neopreno').length * NEOPRENO_BASE_PRICE
  const dijonTotal = sequence
    .filter((s): s is SequenceItem & { kind: 'dijon' } => s.kind === 'dijon')
    .reduce((sum, s) => {
      const d = getDijon(s.id)
      return sum + (d?.price ?? DIJON_BASE_PRICE)
    }, 0)
  const total = basePrice + balinTotal + neoprenoTotal + dijonTotal

  const canProceed = () => {
    switch (step) {
      case 0: return sequence.some((s) => s.kind === 'balin')
      case 1: return jewelType !== null
      case 2: return true
      case 3: return true
      default: return false
    }
  }

  useEffect(() => {
    if (step === 3 && !descFetched.current) {
      descFetched.current = true
      setDescLoading(true)
      const config = { type: jewelType, color, sequence, defaultBalinType, total, productoBase: selectedProduct?.name || null }
      api.post<{ description: string }>('/describe/custom-order', { config })
        .then((r) => setDescription(r.description))
        .catch(() => setDescription(null))
        .finally(() => setDescLoading(false))
    }
  }, [step, jewelType, color, sequence, defaultBalinType, total, selectedProduct])

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
        type: jewelType, color, sequence, defaultBalinType, total,
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

  function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < current ? 'bg-gold-400 text-ebony' :
              i === current ? 'bg-ebony text-white' :
              'bg-pearl text-muted'
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

  function PreviewBlock({ onItemClick }: { onItemClick?: (index: number) => void }) {
    return (
      <div className="mb-6">
        <BeadSequenceViewer
          items={sequence}
          material={material}
          onItemClick={onItemClick}
        />
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <PreviewBlock onItemClick={removeItem} />
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Configura tu Secuencia</p>
                <p className="text-sm text-muted/60 font-light">Arrastra para reordenar, haz clic en un elemento para eliminarlo. Usa los + para insertar entre balines.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {(['liso', 'diamantado'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDefaultBalinType(t)}
                    className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                      defaultBalinType === t ? 'border-gold-400 bg-gold-400/10 text-gold-600 font-bold' : 'border-border text-muted hover:border-gold-400'
                    }`}
                  >
                    Predet: {t === 'liso' ? 'Lisos' : 'Diamantados'}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Button size="sm" variant="outline" onClick={addBalin}>
                  <Plus className="size-3.5 mr-1.5" /> Balín
                </Button>
                <div className="relative group">
                  <Button size="sm" variant="outline">
                    <Plus className="size-3.5 mr-1.5" /> Neopreno
                  </Button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block z-20">
                    <div className="bg-elevated shadow-xl border border-subtle p-3 grid grid-cols-4 gap-2 min-w-[200px]">
                      {NEOPRENO_COLORS.map((n) => (
                        <button
                          key={n.color}
                          onClick={() => addNeopreno(n.color, n.label)}
                          className="flex flex-col items-center gap-1 p-2 hover:bg-surface transition-colors rounded"
                          title={n.label}
                        >
                          {n.image ? (
                            <Image src={n.image} alt={n.label} width={32} height={16} className="shrink-0" />
                          ) : (
                            <div className="size-6 rounded-sm border border-black/10" style={{ backgroundColor: n.color }} />
                          )}
                          <span className="text-[10px] text-muted">{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowDijeGrid(true)}>
                  <Plus className="size-3.5 mr-1.5" /> Dije
                </Button>
              </div>

              {showDijeGrid && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDijeGrid(false)}>
                  <div className="bg-elevated p-6 rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg font-medium text-primary">Selecciona un Dije</h3>
                      <button onClick={() => setShowDijeGrid(false)} className="p-1 hover:bg-hover rounded-full transition-colors">
                        <X className="size-4 text-muted" />
                      </button>
                    </div>
                    <p className="text-xs text-muted mb-4">
                      El dije se agregará al final de la secuencia. Luego puedes reordenarlo arrastrando.
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {DIJONES.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => addDijon(d.id)}
                          className="flex flex-col items-center gap-1.5 p-3 hover:bg-surface transition-colors rounded-lg border border-border hover:border-gold-400"
                          title={d.label}
                        >
                          <Image src={d.image} alt={d.label} width={48} height={48} className="shrink-0" />
                          <span className="text-[10px] text-muted text-center leading-tight">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[360px] overflow-y-auto px-2">
                {sequence.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted text-sm italic">Secuencia vacía. Agrega balines y neoprenos.</p>
                  </div>
                )}
                {sequence.map((item, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 bg-elevated border border-border p-3 rounded-lg transition-all hover:border-gold-400/50 ${
                      dragIndex === i ? 'opacity-50 border-gold-400' : ''
                    }`}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-muted hover:text-gold-600 transition-colors">
                      <GripVertical className="size-4" />
                    </div>

                    {item.kind === 'balin' ? (
                      <>
                        <Image
                          src={`/assets/optimized/balines/balin-${item.type}.webp`}
                          alt={item.type}
                          width={32}
                          height={32}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-primary uppercase">Balín #{i + 1}</span>
                          <div className="flex gap-2 mt-1">
                            <select
                              value={item.type}
                              onChange={(e) => updateBalin(i, 'type', e.target.value)}
                              className="text-[11px] p-1 bg-surface border border-border rounded outline-none focus:border-gold-400"
                            >
                              <option value="liso">Liso</option>
                              <option value="diamantado">Diamantado</option>
                            </select>
                            <select
                              value={item.size}
                              onChange={(e) => updateBalin(i, 'size', e.target.value)}
                              className="text-[11px] p-1 bg-surface border border-border rounded outline-none focus:border-gold-400"
                            >
                              <option value="small">Pequeño</option>
                              <option value="medium">Medio</option>
                              <option value="large">Grande</option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : item.kind === 'dijon' ? (
                      <>
                        <Image src={item.image} alt={item.label} width={32} height={32} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-primary uppercase">Dije #{i + 1}</span>
                          <p className="text-[11px] text-muted">{item.label}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Image src={getNeoprenoImage(item.color)!} alt={item.label} width={32} height={16} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-primary uppercase">Neopreno #{i + 1}</span>
                          <p className="text-[11px] text-muted">{item.label}</p>
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => removeItem(i)}
                      className="p-1 rounded-full hover:bg-red-50 text-muted hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <PreviewBlock />
            <div className="text-center">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-6">Selecciona tu producto base del catálogo</p>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full size-8 border-b-2 border-gold-400" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => {
                      const imgUrl = productImageUrl(product.image_url)
                      const isSelected = selectedProduct?.id === product.id
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`p-3 border-2 text-center transition-all ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400/5 shadow-md ring-1 ring-gold-400/30'
                              : 'border-border hover:border-gold-300 bg-elevated'
                          }`}
                        >
                          <div className="aspect-square mb-2 flex items-center justify-center bg-surface overflow-hidden">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={product.name} width={100} height={100} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Sparkles className="size-6 text-muted" />
                            )}
                          </div>
                          <span className="block text-xs font-medium text-primary leading-tight line-clamp-2">{product.name}</span>
                          <span className="block text-[11px] text-muted mt-0.5">{formatPrice(Number(product.price))}</span>
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
                      className="text-xs text-muted hover:text-primary underline underline-offset-2 transition-colors"
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
            <PreviewBlock />
            <div className="text-center">
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-6">Selecciona el color del metal</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.value)}
                    className={`p-6 border-2 text-center transition-all ${
                      color === c.value ? 'border-gold-400 bg-gold-400/5 shadow-md ring-1 ring-gold-400/30' : 'border-border hover:border-gold-400 bg-elevated'
                    }`}
                  >
                    <div className="size-12 rounded-full mx-auto mb-3 border-2 border-white shadow-sm" style={{ backgroundColor: c.value }} />
                    <span className="block font-heading text-base font-medium text-primary">{c.label}</span>
                    {color === c.value && (
                      <span className="block mt-1 text-[10px] text-gold-400 font-semibold">Seleccionado</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted/50 mt-6 italic">
                Los balines se mostrarán en el color seleccionado
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <PreviewBlock />
            <div className="bg-elevated p-8 border border-subtle">
              {descLoading ? (
                <div className="animate-pulse mb-6">
                  <div className="h-4 bg-pearl/60 w-full rounded" />
                  <div className="h-4 bg-pearl/40 w-3/4 rounded mt-2" />
                </div>
              ) : description ? (
                <p className="text-sm text-muted/80 italic leading-relaxed mb-6 pb-4 border-b border-gold-400/20">
                  &ldquo;{description}&rdquo;
                </p>
              ) : null}

              <h3 className="font-heading text-xl font-medium text-primary mb-6 pb-3 border-b border-gold-400/30">
                Resumen de tu joya personalizada
              </h3>
              <div className="space-y-4">
                {[
                  ['Producto base', selectedProduct?.name || `${jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'} personalizado`],
                  ['Color', COLORS.find((c) => c.value === color)?.label || 'Oro'],
                  ['Composición', sequenceDescription(sequence)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted">{label}</span>
                    <span className="font-medium text-primary">{value}</span>
                  </div>
                ))}
                <hr className="border-border" />
                {[
                  [`Base (${jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'})`, formatPrice(basePrice)],
                  [`Balines (${sequence.filter(s => s.kind === 'balin').length})`, `+${formatPrice(balinTotal)}`],
                  ...(neoprenoTotal > 0 ? [[`Neoprenos (${sequence.filter(s => s.kind === 'neopreno').length})`, `+${formatPrice(neoprenoTotal)}`]] : []),
                  ...(dijonTotal > 0 ? [[`Dijones (${sequence.filter(s => s.kind === 'dijon').length})`, `+${formatPrice(dijonTotal)}`]] : []),
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted">{label as string}</span>
                    <span className="font-medium text-primary">{value as string}</span>
                  </div>
                ))}
                <hr className="border-border" />
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
      <ChatAssistant />
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
            {step < 3 ? (
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
