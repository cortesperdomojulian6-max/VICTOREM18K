'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { productImageUrl, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface SearchBarProps {
  initialValue?: string
  onSearch?: (query: string) => void
  placeholder?: string
  tipo?: 'catalogo' | 'mayoreo'
}

export function SearchBar({ initialValue = '', onSearch, placeholder = "Buscar joyas, estilos, ocasiones...", tipo = 'catalogo' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const delayDebounceFn = setTimeout(() => {
      setLoading(true)
      api.get<Product[]>(`/search?q=${encodeURIComponent(query)}&tipo=${tipo}&limit=5`)
        .then(data => {
          setResults(data)
          setIsOpen(true)
        })
        .catch(err => {
          console.error("Error searching:", err)
          setResults([])
        })
        .finally(() => {
          setLoading(false)
        })
    }, 400) // 400ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [query, tipo])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsOpen(false)
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/${tipo}?search=${encodeURIComponent(query)}`)
      }
    }
  }

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false)
    router.push(`/${tipo}?id=${product.id}`)
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 w-full z-40">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.length >= 2 && results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-pearl bg-white text-sm text-iron placeholder:text-stone/50 focus:outline-none focus:border-gold-400 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)] transition-all"
        />
        {query && (
          <button 
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              if (onSearch) onSearch('')
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <X className="size-4 text-stone/50 hover:text-stone transition-colors" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-pearl shadow-xl max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-stone/50">
              <Loader2 className="size-5 animate-spin mr-2" />
              <span className="text-sm">Buscando...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone/50 border-b border-pearl/50">
                  Sugerencias
              </div>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors border-b border-pearl/20 last:border-0 text-left"
                >
                  <div className="size-12 rounded-sm bg-stone-50 overflow-hidden shrink-0">
                    <img 
                      src={productImageUrl(product.image_url) ?? undefined} 
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-ebony truncate">{product.name}</h4>
                    <p className="text-xs text-stone truncate">{product.category}</p>
                  </div>
                  <div className="text-sm font-semibold text-gold-600 shrink-0">
                    {formatPrice(Number(product.price))}
                  </div>
                </button>
              ))}
              <div 
                className="px-4 py-3 bg-stone-50 hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider text-center text-ebony cursor-pointer border-t border-pearl transition-colors"
                onClick={() => {
                  setIsOpen(false)
                  if (onSearch) onSearch(query)
                  else router.push(`/${tipo}?search=${encodeURIComponent(query)}`)
                }}
              >
                Ver todos los resultados para "{query}"
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-stone">
              No encontramos resultados exactos para "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  )
}
