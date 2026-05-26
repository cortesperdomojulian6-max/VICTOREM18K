'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import {
  BEAD_IMAGE_SIZES,
  DIJON_VIEW_SIZE,
  getNeoprenoDisplaySize,
  getBeadImagePath,
  getNeoprenoImage,
} from '@/lib/personalizacion'
import type { SequenceItem, BalinSize, MaterialName } from '@/lib/personalizacion'

interface BeadSequenceViewerProps {
  items: SequenceItem[]
  material?: MaterialName
  beadSize?: BalinSize
  onInsertBetween?: (index: number) => void
  onInsertDijonBetween?: (index: number) => void
  onItemClick?: (index: number) => void
}

export default function BeadSequenceViewer({
  items,
  material = 'gold',
  beadSize = 'medium',
  onInsertBetween,
  onInsertDijonBetween,
  onItemClick,
}: BeadSequenceViewerProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInsert = !!onInsertBetween

  const beadPx = BEAD_IMAGE_SIZES[beadSize]

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
      <div className="w-full h-20 relative overflow-hidden bg-black rounded-xl flex items-center justify-center">
        <div className="text-white/15 text-[10px] uppercase tracking-widest">
          Secuencia vacía
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative overflow-hidden bg-black rounded-xl">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-3 px-4 overflow-x-auto"
        style={{ minHeight: `${beadPx + 24}px` }}
      >
        <div className="flex items-center" style={{ gap: 0 }}>
          {items.map((item, i) => (
            <div key={`${item.kind}-${i}`} className="flex items-center relative" style={{ margin: 0, padding: 0 }}>
              {hasInsert && (
                <div className="relative" style={{ margin: 0, padding: 0 }}>
                  <button
                    type="button"
                    onClick={() => setMenuIndex(menuIndex === i ? null : i)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-3.5 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg"
                    title="Insertar aquí"
                    style={{ margin: 0, padding: 0 }}
                  >
                    <Plus className="size-2.5" />
                  </button>
                  {menuIndex === i && (
                    <div className="absolute left-0 bottom-full mb-1 z-20 flex gap-0.5 bg-white rounded-lg shadow-xl border border-pearl p-1" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => { onInsertBetween(i); closeMenu() }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap font-medium"
                      >
                        Balín
                      </button>
                      <button
                        type="button"
                        onClick={() => { onInsertDijonBetween?.(i); closeMenu() }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap font-medium"
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
                  style={{ margin: 0, padding: 0 }}
                >
                  <Image
                    src={getBeadImagePath(item.type, material, item.size)}
                    alt={`Balín ${item.type}`}
                    width={BEAD_IMAGE_SIZES[item.size]}
                    height={BEAD_IMAGE_SIZES[item.size]}
                    draggable={false}
                    style={{ display: 'block', margin: 0, padding: 0 }}
                  />
                </div>
              ) : item.kind === 'dijon' ? (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  title={item.label}
                  style={{ margin: 0, padding: 0 }}
                >
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={DIJON_VIEW_SIZE}
                    height={DIJON_VIEW_SIZE}
                    draggable={false}
                    style={{ display: 'block', margin: 0, padding: 0 }}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  title={`Neopreno: ${item.label}`}
                  style={{ margin: 0, padding: 0 }}
                >
                  <Image
                    src={getNeoprenoImage(item.color)!}
                    alt={item.label}
                    width={getNeoprenoDisplaySize(beadPx).width}
                    height={getNeoprenoDisplaySize(beadPx).height}
                    draggable={false}
                    style={{ display: 'block', margin: 0, padding: 0 }}
                  />
                </div>
              )}
            </div>
          ))}

          {hasInsert && (
            <div className="relative shrink-0" style={{ margin: 0, padding: 0 }}>
              <button
                type="button"
                onClick={() => setMenuIndex(menuIndex === items.length ? null : items.length)}
                className="size-3.5 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg"
                title="Insertar al final"
                style={{ margin: 0, padding: 0 }}
              >
                <Plus className="size-2.5" />
              </button>
              {menuIndex === items.length && (
                <div className="absolute bottom-full mb-1 right-0 z-20 flex gap-0.5 bg-white rounded-lg shadow-xl border border-pearl p-1" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => { onInsertBetween(items.length); closeMenu() }}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap font-medium"
                  >
                    Balín
                  </button>
                  <button
                    type="button"
                    onClick={() => { onInsertDijonBetween?.(items.length); closeMenu() }}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-gold-100 text-ebony transition-colors whitespace-nowrap font-medium"
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