'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import {
  BEAD_IMAGE_SIZES,
  DIJON_VIEW_SIZE,
  NEOPRENO_VIEW_WIDTH,
  NEOPRENO_VIEW_HEIGHT,
  getBeadImagePath,
  getNeoprenoImage,
} from '@/lib/personalizacion'
import type { SequenceItem, MaterialName } from '@/lib/personalizacion'

interface BeadSequenceViewerProps {
  items: SequenceItem[]
  material?: MaterialName
  onInsertBetween?: (index: number) => void
  onInsertDijonBetween?: (index: number) => void
  onItemClick?: (index: number) => void
}

export default function BeadSequenceViewer({
  items, material = 'gold', onInsertBetween, onInsertDijonBetween, onItemClick,
}: BeadSequenceViewerProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInsert = !!onInsertBetween

  const closeMenu = useCallback(() => setMenuIndex(null), [])

  useEffect(() => {
    if (menuIndex === null) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuIndex, closeMenu])

  if (items.length === 0) {
    return (
      <div className="w-full h-24 md:h-32 relative overflow-hidden bg-black rounded-xl flex items-center justify-center">
        <div className="text-white/20 text-xs uppercase tracking-widest">
          Secuencia vacía — agrega balines para comenzar
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative overflow-hidden bg-black rounded-xl">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-4 md:py-6 px-4 overflow-x-auto"
        style={{ minHeight: '100px' }}
      >
        <div className="flex items-center relative">
          {items.map((item, i) => (
            <div key={`${item.kind}-${i}`} className="flex items-center relative">
              {hasInsert && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuIndex(menuIndex === i ? null : i)}
                    className="absolute -left-2 z-10 size-4 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg opacity-0 hover:opacity-100"
                    title="Insertar aquí"
                  >
                    <Plus className="size-3" />
                  </button>
                  {menuIndex === i && (
                    <div className="absolute -left-2 bottom-full mb-2 z-20 flex gap-1 bg-white rounded-lg shadow-xl border border-pearl p-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => { onInsertBetween(i); closeMenu() }}
                        className="text-[10px] px-2 py-1 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap"
                      >
                        Balín
                      </button>
                      <button
                        type="button"
                        onClick={() => { onInsertDijonBetween?.(i); closeMenu() }}
                        className="text-[10px] px-2 py-1 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap"
                      >
                        Dije
                      </button>
                    </div>
                  )}
                </div>
              )}

              {item.kind === 'balin' ? (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                >
                  <Image
                    src={getBeadImagePath(item.type, material, item.size)}
                    alt={`Balín ${item.type}`}
                    width={BEAD_IMAGE_SIZES[item.size]}
                    height={BEAD_IMAGE_SIZES[item.size]}
                    className="inline-block"
                    draggable={false}
                  />
                </div>
              ) : item.kind === 'dijon' ? (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  title={item.label}
                >
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={DIJON_VIEW_SIZE}
                    height={DIJON_VIEW_SIZE}
                    className="inline-block"
                    draggable={false}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-center shrink-0 mx-0.5 rounded-sm ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  title={`Neopreno: ${item.label}`}
                >
                  <Image
                    src={getNeoprenoImage(item.color)!}
                    alt={item.label}
                    width={NEOPRENO_VIEW_WIDTH}
                    height={NEOPRENO_VIEW_HEIGHT}
                    className="inline-block"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))}

          {hasInsert && (
            <div className="relative ml-1 shrink-0">
              <button
                type="button"
                onClick={() => setMenuIndex(menuIndex === items.length ? null : items.length)}
                className="size-4 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg"
                title="Insertar al final"
              >
                <Plus className="size-3" />
              </button>
              {menuIndex === items.length && (
                <div className="absolute bottom-full mb-2 right-0 z-20 flex gap-1 bg-white rounded-lg shadow-xl border border-pearl p-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => { onInsertBetween(items.length); closeMenu() }}
                    className="text-[10px] px-2 py-1 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap"
                  >
                    Balín
                  </button>
                  <button
                    type="button"
                    onClick={() => { onInsertDijonBetween?.(items.length); closeMenu() }}
                    className="text-[10px] px-2 py-1 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap"
                  >
                    Dije
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}