'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ArrowRight, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Confetti } from '@/components/ui/confetti'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

const JewelryViewer = dynamic(() => import('@/components/personalizacion/JewelryViewer'), {
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
  { id: 1, label: 'Tipo de Joya' },
  { id: 2, label: 'Dije' },
  { id: 3, label: 'Color' },
  { id: 4, label: 'Balines' },
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

// JewelPreview removed in favor of JewelryViewer

export default function PersonalizacionPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [jewelType, setJewelType] = useState<JewelType | null>(null)
  const [dije, setDije] = useState<DijeName | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [balines, setBalines] = useState<number>(6)
  const [showConfetti, setShowConfetti] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()

  const basePrice = jewelType ? BASE_PRICES[jewelType] : 0
  const dijePrice = dije ? DIJES.find((d) => d.name === dije)?.price || 0 : 0
  const balinPrice = (balines / 2) * BALIN_PRICE
  const total = basePrice + dijePrice + balinPrice

  const canProceed = () => {
    switch (step) {
      case 0: return jewelType !== null
      case 1: return dije !== null
      case 2: return color !== null
      case 3: return true
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
      const products = await api.get<{ id: number; name: string }[]>('/products')
      const custom = products.find((p) => p.name === 'Joya Personalizada' || p.name.toLowerCase().includes('personalizada'))
      if (!custom) { toast.error('Error: Producto personalizado no configurado'); return }

      await addItem(custom.id, 1)

      localStorage.setItem('personalizacion', JSON.stringify({
        type: jewelType, dije, color, balines, total, fecha: new Date().toISOString(),
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
          <div>
            <div className="mb-6">
              <JewelryViewer type={jewelType} dije={dije} color={COLORS.find((c) => c.value === color)?.value || null} balines={balines} />
            </div>
            <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-6">Selecciona el tipo de joya</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['pulsera', 'anillo'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setJewelType(type)}
                  className={`p-8 border-2 text-center transition-all ${
                    jewelType === type ? 'border-gold-400 bg-gold-400/5 shadow-md' : 'border-pearl hover:border-gold-400 bg-white'
                  }`}
                >
                  {type === 'pulsera' ? (
                    <Image src="/assets/images/pulsera icono.png" alt="" width={48} height={48} className="mx-auto mb-3 opacity-60" />
                  ) : (
                    <Image src="/assets/images/anillo icono.png" alt="" width={48} height={48} className="mx-auto mb-3 opacity-60" />
                  )}
                  <span className="block font-heading text-2xl font-medium text-ebony mb-2">
                    {type === 'pulsera' ? 'Pulsera' : 'Anillo'}
                  </span>
                  <span className="text-sm text-stone">Desde {formatPrice(BASE_PRICES[type])}</span>
                  {jewelType === type && (
                    <span className="block mt-3 text-xs text-gold-400 font-semibold uppercase tracking-wider">
                      Seleccionado <Check className="size-3.5 inline ml-1" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div>
            <div className="mb-6">
              <JewelryViewer type={jewelType} dije={dije} color={COLORS.find((c) => c.value === color)?.value || null} balines={balines} />
            </div>
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
        )

      case 2:
        return (
          <div>
            <div className="mb-6">
              <JewelryViewer type={jewelType} dije={dije} color={COLORS.find((c) => c.value === color)?.value || null} balines={balines} />
            </div>
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
        )

      case 3:
        return (
          <div>
            <div className="mb-6">
              <JewelryViewer type={jewelType} dije={dije} color={COLORS.find((c) => c.value === color)?.value || null} balines={balines} />
            </div>
            <p className="text-xs text-stone font-semibold uppercase tracking-wider mb-2">Número de balines</p>
            <p className="text-sm text-stone mb-6">Elige la cantidad (solo pares, de 4 a 10)</p>
            <div className="flex flex-wrap gap-3">
              {[4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setBalines(n)}
                  className={`min-w-[80px] p-4 border-2 text-center transition-all ${
                    balines === n ? 'border-gold-400 bg-gold-400/5 shadow-md' : 'border-pearl hover:border-gold-400 bg-white'
                  }`}
                >
                  <span className="block font-heading text-xl font-medium text-ebony">{n}</span>
                  <span className="text-xs text-stone">{formatPrice((n / 2) * BALIN_PRICE)}</span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <input
                type="range"
                min={4}
                max={10}
                step={2}
                value={balines}
                onChange={(e) => setBalines(Number(e.target.value))}
                className="w-full h-1.5 bg-pearl appearance-none cursor-pointer accent-gold-400"
              />
              <div className="flex justify-between text-xs text-stone mt-1">
                <span>4</span>
                <span>10</span>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <div className="mb-6">
              <JewelryViewer type={jewelType} dije={dije} color={COLORS.find((c) => c.value === color)?.value || null} balines={balines} />
            </div>
            <div className="bg-white p-8 border border-black/4">
              <h3 className="font-heading text-xl font-medium text-ebony mb-6 pb-3 border-b border-gold-400/30">
                Resumen de tu joya personalizada
              </h3>
              <div className="space-y-4">
                {[
                  ['Tipo', jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'],
                  ['Dije', DIJES.find((d) => d.name === dije)?.label],
                  ['Color', COLORS.find((c) => c.value === color)?.label],
                  ['Balines', String(balines)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-stone">{label}</span>
                    <span className="font-medium text-ebony">{value}</span>
                  </div>
                ))}
                <hr className="border-pearl" />
                {[
                  [`Base (${jewelType === 'pulsera' ? 'Pulsera' : 'Anillo'})`, formatPrice(basePrice)],
                  [`Dije (${DIJES.find((d) => d.name === dije)?.label})`, `+${formatPrice(dijePrice)}`],
                  [`Balines (${balines} × ${formatPrice(BALIN_PRICE)}/2)`, `+${formatPrice(balinPrice)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-stone">{label}</span>
                    <span className="font-medium text-ebony">{value}</span>
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
