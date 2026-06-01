'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Package, Check, RefreshCw, ChevronDown, ChevronUp, ShoppingCart, Plus, Minus, Trash2, X, Send, Circle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { INSUMOS, INSUMO_CATEGORIES } from '@/lib/personalizacion'
import type { InsumoProduct, BalinVariant } from '@/lib/personalizacion'

const QTY_TIERS = [
  { key: 'qty10', label: '10 und', value: 10 },
  { key: 'qty50', label: '50 und', value: 50 },
  { key: 'qty100', label: '100 und', value: 100 },
] as const

const BEAD_SIZES = [3, 4, 5, 6, 8] as const
const BEAD_VISUAL_SCALE: Record<number, number> = { 3: 28, 4: 34, 5: 42, 6: 48, 8: 60 }

interface QuoteItem {
  id: string
  type: 'liso' | 'diamantado'
  size: number
  quantity: number
  unitPrice: number
  total: number
}

const QUOTE_STORAGE_KEY = 'victorem-insumos-quote'

function loadQuote(): QuoteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveQuote(items: QuoteItem[]) {
  try {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function InsumosPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [pricingMode, setPricingMode] = useState<'retail' | 'wholesale'>('retail')
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [showQuote, setShowQuote] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number | null>>({})

  useEffect(() => {
    setQuoteItems(loadQuote())
  }, [])

  useEffect(() => {
    saveQuote(quoteItems)
  }, [quoteItems])

  const addToQuote = useCallback((item: QuoteItem) => {
    setQuoteItems(prev => [...prev, item])
  }, [])

  const removeFromQuote = useCallback((id: string) => {
    setQuoteItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearQuote = useCallback(() => {
    setQuoteItems([])
  }, [])

  const quoteTotal = quoteItems.reduce((sum, i) => sum + i.total, 0)

  const filtered = INSUMOS.filter((p) => {
    if (category && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <Link href="/" className="hover:text-gold-400 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/80">Insumos</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Insumos para Joyería
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Balines, neoprenos, dijes, hilos y tablas para profesionales y aficionados.
            Precios al detal y al por mayor.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar insumo..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-elevated border border-border focus:border-gold-400 outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuote(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gold-400 text-gold-600 hover:bg-gold-400/10 transition-all"
            >
              <ShoppingCart className="size-3.5" />
              Cotización
              {quoteItems.length > 0 && (
                <span className="absolute -top-2 -right-2 size-5 rounded-full bg-gold-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {quoteItems.length}
                </span>
              )}
            </button>
            <div className="flex gap-1 bg-hover rounded-lg p-1">
              <button
                onClick={() => setPricingMode('retail')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                  pricingMode === 'retail' ? 'bg-elevated text-primary shadow-sm' : 'text-muted hover:text-primary'
                }`}
              >
                Detal
              </button>
              <button
                onClick={() => setPricingMode('wholesale')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                  pricingMode === 'wholesale' ? 'bg-elevated text-primary shadow-sm' : 'text-muted hover:text-primary'
                }`}
              >
                <Package className="size-3 inline-block mr-1" />
                Mayor
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-all ${
              category === null
                ? 'border-gold-400 bg-gold-400/10 text-gold-600 font-semibold'
                : 'border-border text-muted hover:border-gold-400'
            }`}
          >
            Todos
          </button>
          {INSUMO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-all ${
                category === cat.id
                  ? 'border-gold-400 bg-gold-400/10 text-gold-600 font-semibold'
                  : 'border-border text-muted hover:border-gold-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="size-10 text-muted/30 mx-auto mb-4" />
            <p className="text-muted text-sm">No se encontraron insumos con ese filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) =>
              product.balinVariants ? (
                <BalinCard
                  key={product.id}
                  product={product}
                  mode={pricingMode}
                  onAddToQuote={addToQuote}
                  selectedSize={selectedSizes[product.id] ?? null}
                  onSelectSize={(s) => setSelectedSizes(prev => ({ ...prev, [product.id]: s }))}
                />
              ) : (
                <InsumoCard key={product.id} product={product} mode={pricingMode} />
              )
            )}
          </div>
        )}

        {pricingMode === 'wholesale' && (
          <div className="mt-12 p-6 bg-ebony/5 border border-gold-400/20 rounded-xl text-center">
            <RefreshCw className="size-5 text-gold-400 mx-auto mb-2" />
            <p className="text-sm text-muted max-w-md mx-auto">
              Precios al por mayor válidos a partir de la cantidad mínima indicada.
              Para pedidos superiores a 500 unidades, contáctanos para un precio especial.
            </p>
          </div>
        )}
      </div>

      {showQuote && (
        <QuoteModal
          items={quoteItems}
          total={quoteTotal}
          onClose={() => setShowQuote(false)}
          onRemove={removeFromQuote}
          onClear={clearQuote}
        />
      )}
    </>
  )
}

function BalinCard({ product, mode, onAddToQuote, selectedSize, onSelectSize }: {
  product: InsumoProduct
  mode: 'retail' | 'wholesale'
  onAddToQuote: (item: QuoteItem) => void
  selectedSize: number | null
  onSelectSize: (size: number | null) => void
}) {
  const variants = product.balinVariants!
  const isLiso = product.id === 'balin-liso'
  const beadImage = isLiso ? '/assets/optimized/balines/balin-liso.webp' : '/assets/optimized/balines/balin-diamantado.webp'

  const selectedVariant = selectedSize
    ? variants.find(v => v.size === `#${selectedSize}`)
    : null

  const [qty, setQty] = useState(10)

  const availableQty = mode === 'retail'
    ? [10]
    : [50, 100]

  const effectiveQty = availableQty.includes(qty) ? qty : availableQty[0]

  const getUnitPrice = () => {
    if (!selectedVariant) return 0
    if (mode === 'retail') return selectedVariant.prices.qty10
    if (effectiveQty >= 100) return selectedVariant.prices.qty100
    if (effectiveQty >= 50) return selectedVariant.prices.qty50
    return selectedVariant.prices.qty10
  }

  const unitPrice = getUnitPrice()
  const totalPrice = unitPrice * effectiveQty

  const handleAdd = () => {
    if (!selectedSize) return
    const id = `${product.id}-${selectedSize}-${effectiveQty}-${Date.now()}`
    onAddToQuote({
      id,
      type: isLiso ? 'liso' : 'diamantado',
      size: selectedSize,
      quantity: effectiveQty,
      unitPrice,
      total: totalPrice,
    })
  }

  return (
    <div className="group bg-elevated border border-border hover:border-gold-400/60 transition-all duration-300 flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col items-center justify-center p-4 relative">
        <div className="flex items-end justify-center gap-2 mb-3 h-20">
          {BEAD_SIZES.map((size) => {
            const px = BEAD_VISUAL_SCALE[size]
            const isSelected = selectedSize === size
            return (
              <button
                key={size}
                onClick={() => onSelectSize(isSelected ? null : size)}
                className={`relative flex flex-col items-center transition-all duration-200 ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
                title={`Talla #${size}`}
              >
                <div
                  className={`rounded-full bg-gradient-to-br from-stone-200 to-stone-300 overflow-hidden transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-gold-500 ring-offset-2' : 'ring-1 ring-stone-300/30'
                  }`}
                  style={{ width: px, height: px }}
                >
                  <Image
                    src={beadImage}
                    alt={`#${size}`}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                  isSelected ? 'text-gold-600' : 'text-muted/60'
                }`}>
                  #{size}
                </span>
              </button>
            )
          })}
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted/30">Selecciona una talla</span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-widest text-muted/40 mb-1">Balines</span>
        <h3 className="font-heading text-sm font-medium text-primary mb-2">{product.name}</h3>

        {selectedVariant && (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3 mb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-primary">Talla #{selectedSize}</span>
              <span className="text-[11px] text-gold-600 font-bold">{formatPrice(unitPrice)} <span className="text-[9px] font-normal text-muted/50">c/u</span></span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted">Cantidad</span>
              <div className="flex items-center gap-1">
                {availableQty.map((a) => (
                  <button
                    key={a}
                    onClick={() => setQty(a)}
                    className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                      effectiveQty === a
                        ? 'bg-gold-600 text-white'
                        : 'bg-elevated text-muted border border-border hover:border-gold-400'
                    }`}
                  >
                    {a} und
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-amber-200/40">
              <span className="text-[10px] text-muted">Total</span>
              <span className="text-sm font-bold text-gold-600">{formatPrice(totalPrice)}</span>
            </div>

            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-wider bg-gold-600 text-white hover:bg-gold-700 transition-colors rounded"
            >
              <Plus className="size-3" />
              Agregar a cotización
            </button>
          </div>
        )}

        {!selectedVariant && (
          <div className="text-center py-3">
            <Circle className="size-5 text-muted/20 mx-auto mb-1" />
            <p className="text-[10px] text-muted/40">Selecciona una talla arriba para ver precios</p>
          </div>
        )}
      </div>
    </div>
  )
}

function QuoteModal({ items, total, onClose, onRemove, onClear }: {
  items: QuoteItem[]
  total: number
  onClose: () => void
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const typeLabel = (t: 'liso' | 'diamantado') => t === 'liso' ? 'Balín Liso' : 'Balín Diamantado'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-elevated w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-gold-600" />
            <h2 className="font-heading text-sm font-semibold text-primary">Cotización de Insumos</h2>
          </div>
          <button onClick={onClose} className="text-muted/40 hover:text-primary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <Package className="size-8 text-muted/20 mx-auto mb-3" />
              <p className="text-sm text-muted/40">No hay insumos en tu cotización</p>
              <p className="text-[11px] text-muted/30 mt-1">Selecciona una talla y agrégalo desde la tarjeta del producto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-lg group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-primary truncate">{typeLabel(item.type)}</p>
                    <p className="text-[10px] text-muted/50">
                      Talla #{item.size} &middot; {item.quantity} und &middot; {formatPrice(item.unitPrice)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-gold-600 whitespace-nowrap">{formatPrice(item.total)}</span>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-muted/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Total cotización</span>
              <span className="text-lg font-bold text-gold-600">{formatPrice(total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClear}
                className="flex-1 py-2.5 text-[11px] font-medium text-muted border border-border hover:border-red-300 hover:text-red-600 transition-all rounded"
              >
                Limpiar todo
              </button>
              <button
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hola, quiero solicitar cotización para los siguientes insumos:\n\n` +
                    items.map(i => `• ${typeLabel(i.type)} #${i.size} - ${i.quantity} und - ${formatPrice(i.total)}`).join('\n') +
                    `\n\nTotal: ${formatPrice(total)}`
                  )
                  window.open(`https://wa.me/573113294297?text=${message}`, '_blank')
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider bg-green-600 text-white hover:bg-green-700 transition-all rounded"
              >
                <Send className="size-3.5" />
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InsumoCard({ product, mode }: { product: InsumoProduct; mode: 'retail' | 'wholesale' }) {
  const price = mode === 'retail' ? product.retailPrice : product.wholesalePrice
  const priceLabel = mode === 'retail' ? 'Precio detal' : 'Precio mayor'

  return (
    <div className="group bg-elevated border border-border hover:border-gold-400/60 transition-all duration-300 flex flex-col">
      <div className="aspect-square bg-surface flex items-center justify-center p-6 relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={120}
            height={mode === 'retail' ? 120 : 80}
            className="object-contain max-h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted/40">
            <Package className="size-10" />
            <span className="text-[10px] uppercase tracking-wider">Próximamente</span>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1">
            {product.colors.map((c, i) => (
              <div
                key={i}
                className="size-3 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: c }}
                title={`Color disponible`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-widest text-muted/40 mb-1">
          {INSUMO_CATEGORIES.find(c => c.id === product.category)?.label || product.category}
        </span>
        <h3 className="font-heading text-sm font-medium text-primary mb-1">{product.name}</h3>
        <p className="text-[10px] text-muted/50 mb-3">Por {product.unit}</p>

        <div className="mt-auto">
          {price !== undefined && (
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-gold-600 text-lg">{formatPrice(price)}</span>
              {mode === 'retail' && product.wholesalePrice && (
                <span className="text-[10px] text-muted/40 line-through">{formatPrice(product.wholesalePrice)}</span>
              )}
            </div>
          )}

          {mode === 'wholesale' && product.wholesaleMinQty && (
            <p className="text-[10px] text-muted/50 mt-1">
              Mín. {product.wholesaleMinQty} {product.unit}(s)
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              mode === 'wholesale'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}>
              <Check className="size-2.5" />
              {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}