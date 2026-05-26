'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Package, Check, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { INSUMOS, INSUMO_CATEGORIES } from '@/lib/personalizacion'
import type { InsumoProduct } from '@/lib/personalizacion'

export default function InsumosPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [pricingMode, setPricingMode] = useState<'retail' | 'wholesale'>('retail')

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar insumo..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-pearl focus:border-gold-400 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setPricingMode('retail')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                pricingMode === 'retail' ? 'bg-white text-ebony shadow-sm' : 'text-stone hover:text-ebony'
              }`}
            >
              Detal
            </button>
            <button
              onClick={() => setPricingMode('wholesale')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                pricingMode === 'wholesale' ? 'bg-white text-ebony shadow-sm' : 'text-stone hover:text-ebony'
              }`}
            >
              <Package className="size-3 inline-block mr-1" />
              Mayor
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-all ${
              category === null
                ? 'border-gold-400 bg-gold-400/10 text-gold-600 font-semibold'
                : 'border-pearl text-stone hover:border-gold-400'
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
                  : 'border-pearl text-stone hover:border-gold-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="size-10 text-stone/30 mx-auto mb-4" />
            <p className="text-stone text-sm">No se encontraron insumos con ese filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <InsumoCard key={product.id} product={product} mode={pricingMode} />
            ))}
          </div>
        )}

        {pricingMode === 'wholesale' && (
          <div className="mt-12 p-6 bg-ebony/5 border border-gold-400/20 rounded-xl text-center">
            <RefreshCw className="size-5 text-gold-400 mx-auto mb-2" />
            <p className="text-sm text-stone max-w-md mx-auto">
              Precios al por mayor válidos a partir de la cantidad mínima indicada.
              Para pedidos superiores a 500 unidades, contáctanos para un precio especial.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function InsumoCard({ product, mode }: { product: InsumoProduct; mode: 'retail' | 'wholesale' }) {
  const price = mode === 'retail' ? product.retailPrice : product.wholesalePrice
  const priceLabel = mode === 'retail' ? 'Precio detal' : 'Precio mayor'

  return (
    <div className="group bg-white border border-pearl hover:border-gold-400/60 transition-all duration-300 flex flex-col">
      <div className="aspect-square bg-stone-50 flex items-center justify-center p-6 relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={120}
            height={mode === 'retail' ? 120 : 80}
            className="object-contain max-h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-stone/40">
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
        <span className="text-[10px] uppercase tracking-widest text-stone/40 mb-1">
          {INSUMO_CATEGORIES.find(c => c.id === product.category)?.label || product.category}
        </span>
        <h3 className="font-heading text-sm font-medium text-ebony mb-1">{product.name}</h3>
        <p className="text-[10px] text-stone/50 mb-3">Por {product.unit}</p>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-gold-600 text-lg">{formatPrice(price)}</span>
            {mode === 'retail' && (
              <span className="text-[10px] text-stone/40 line-through">{formatPrice(product.wholesalePrice)}</span>
            )}
          </div>

          {mode === 'wholesale' && (
            <p className="text-[10px] text-stone/50 mt-1">
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