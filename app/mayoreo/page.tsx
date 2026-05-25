'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/ui/card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/ui/search-bar'
import { api } from '@/lib/api'
import { productImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import { motion } from 'framer-motion'

export default function MayoreoPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // En un caso real buscaríamos por tipo=mayoreo
        const endpoint = search 
          ? `/search?q=${encodeURIComponent(search)}&tipo=mayoreo&limit=50` 
          : '/products' // idealmente /products?tipo=mayoreo
        const data = await api.get<Product[]>(endpoint)
        
        // Simular que filtramos solo mayoreo/insumos por ahora
        // Ya que la BD de prueba no los tiene marcados
        setProducts(data)
      } catch (err) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [searchParams, search])

  const filtered = useMemo(() => {
    let result = [...products]
    // Solo ordenamos, la búsqueda ya la hizo el backend
    result.sort((a, b) => Number(a.price) - Number(b.price))
    return result
  }, [products])

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Mayoreo e Insumos</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Mayoreo
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Insumos para artesanos y ventas al por mayor. Balines, dijones y neoprenos para tus creaciones.
          </p>
        </div>
      </div>

      <div className="container-main py-8 md:py-10">
        <div className="flex flex-col gap-4 mb-8">
          <SearchBar 
            initialValue={search} 
            onSearch={setSearch} 
            tipo="mayoreo"
            placeholder="Buscar balines 4mm, hilos, insumos..."
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-xs text-stone/60 mb-6">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
                    imageUrl={productImageUrl(product.image_url)}
                    view_count={product.view_count}
                    onViewDetail={() => {}}
                  />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <SlidersHorizontal className="size-12 text-pearl mx-auto mb-4" />
            <h2 className="font-heading text-xl font-medium text-ebony mb-2">
              {search ? `No encontramos insumos para "${search}"` : 'No encontramos insumos'}
            </h2>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-3 mt-4 text-xs font-semibold uppercase tracking-wider bg-gold-400 text-ebony hover:bg-gold-500 transition-colors"
            >
              Limpiar Búsqueda
            </button>
          </div>
        )}
      </div>
    </>
  )
}
