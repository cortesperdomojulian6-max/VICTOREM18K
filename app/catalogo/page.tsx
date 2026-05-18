'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { ProductCard } from '@/components/ui/card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Product } from '@/types'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'pulsos', label: 'Pulsos' },
  { value: 'anillos', label: 'Anillos' },
  { value: 'manillas', label: 'Manillas' },
] as const

type SortKey = 'popularity' | 'price-asc' | 'price-desc' | 'name'

export default function CatalogoPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortKey>('popularity')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const productId = searchParams.get('id')
    api.get<Product[]>('/products')
      .then((data) => {
        if (productId) {
          const el = document.getElementById(`product-${productId}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setProducts(data)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchParams])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = useMemo(() => {
    let result = [...products]

    if (category) {
      result = result.filter((p) => p.category === category)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0))
    }

    return result
  }, [products, category, search, sort])

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Catálogo</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Nuestro Catálogo
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Explora nuestra colección de joyas artesanales en balinería, cada pieza está hecha a mano con oro laminado 18K.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center">
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar joyas... (Cmd+K)"
              className="w-full pl-10 pr-4 py-3 border border-pearl bg-white text-sm text-iron placeholder:text-stone/50 focus:outline-none focus:border-gold-400 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)] transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  category === cat.value
                    ? 'bg-gold-400 text-ebony'
                    : 'bg-white border border-pearl text-stone hover:border-gold-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none px-4 py-2.5 pr-10 border border-pearl bg-white text-xs font-semibold uppercase tracking-wider text-stone cursor-pointer focus:outline-none focus:border-gold-400"
              aria-label="Ordenar por"
            >
              <option value="popularity">Popularidad</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-stone pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-xs text-stone mb-6">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  id={`product-${product.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description || ''}
                    price={Number(product.price)}
                    imageUrl={product.image_url?.replace(/^imagenes\//, '/assets/images/') || null}
                    view_count={product.view_count}
                  />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <SlidersHorizontal className="size-12 text-pearl mx-auto mb-4" />
            <h2 className="font-heading text-xl font-medium text-ebony mb-2">
              {search ? `No encontramos productos para "${search}"` : 'No encontramos productos'}
            </h2>
            <p className="text-sm text-stone mb-6">
              Intenta con otros términos o limpia los filtros
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('') }}
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-gold-400 text-ebony hover:bg-gold-500 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </>
  )
}
