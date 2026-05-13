'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/ui/card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Product } from '@/types'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { value: 'todos', label: 'Todos' },
  { value: 'pulsos', label: 'Pulsos' },
  { value: 'anillos', label: 'Anillos' },
  { value: 'manillas', label: 'Manillas' },
] as const

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todos')
  const [sort, setSort] = useState('popularidad')

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = [...products]

    if (category !== 'todos') {
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
      case 'precio-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'precio-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'nombre':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return result
  }, [products, category, search, sort])

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
              <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
              <span>/</span>
              <span className="text-white/80">Catálogo</span>
            </nav>
            <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
              Catálogo
            </h1>
            <p className="text-sm text-white/50 mt-3 max-w-lg">
              Cada pieza es una obra maestra única, creada con la más fina técnica artesanal y materiales de la más alta calidad.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  category === cat.value
                    ? 'bg-ebony text-white'
                    : 'bg-white text-stone border border-pearl hover:border-gold-400 hover:text-gold-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="w-full pl-9 pr-8 py-2.5 border border-pearl text-sm bg-white text-ebony focus:outline-none focus:border-gold-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ebony">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 border border-pearl text-sm bg-white text-ebony focus:outline-none focus:border-gold-400"
            >
              <option value="popularidad">Popularidad</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone text-lg mb-2">No encontramos productos</p>
            <p className="text-sm text-stone/60 mb-6">Intenta con otros filtros o términos de búsqueda</p>
            <Button onClick={() => { setSearch(''); setCategory('todos') }}>
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <ProductCard
                  id={p.id}
                  name={p.name}
                  description={p.description || ''}
                  price={Number(p.price)}
                  imageUrl={p.image_url?.replace(/^imagenes\//, '/assets/images/') || null}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
