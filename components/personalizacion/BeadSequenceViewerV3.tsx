'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import {
  BEAD_IMAGE_SIZES,
  DIJON_VIEW_SIZE,
  NEOPRENO_COLORS,
  getNeoprenoDisplaySize,
  getBeadImagePath,
  getNeoprenoImage,
} from '@/lib/personalizacion'
import type { SequenceItem, BalinSize, MaterialName } from '@/lib/personalizacion'

interface BeadSequenceViewerProps {
  items: SequenceItem[]
  material?: MaterialName
  beadSize?: BalinSize
  onInsertBalin?: (index: number) => void
  onInsertDijon?: (index: number) => void
  onInsertNeopreno?: (index: number, color: string, label: string) => void
  onItemClick?: (index: number) => void
}

export default function BeadSequenceViewerV3({
  items,
  material = 'gold',
  beadSize = 'medium',
  onInsertBalin,
  onInsertDijon,
  onInsertNeopreno,
  onItemClick,
}: BeadSequenceViewerProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInsert = !!(onInsertBalin || onInsertDijon || onInsertNeopreno)
  const beadPx = BEAD_IMAGE_SIZES[beadSize]

  const closeMenu = useCallback(() => setMenuIndex(null), [])

  useEffect(() => {
    if (menuIndex === null) return
    const handleClick = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuIndex, closeMenu])

  if (items.length === 0) {
    return (
      <div className="w-full h-24 relative overflow-hidden bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
        {hasInsert ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Secuencia vacía</span>
            <button
              onClick={() => setMenuIndex(0)}
              className="size-6 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              aria-label="Agregar primera pieza"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Secuencia vacía</span>
        )}
      </div>
    )
  }

  const InsertMenu = ({ index }: { index: number }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 bg-white rounded-lg shadow-2xl border border-zinc-200 p-3 flex flex-col gap-1 min-w-[150px]">
      <div className="text-[10px] font-bold text-zinc-400 uppercase text-center mb-1">Agregar pieza</div>
      <button
        onClick={() => { onInsertBalin?.(index); setMenuIndex(null) }}
        className="text-left px-3 py-2 text-xs font-semibold text-black hover:bg-zinc-100 rounded-md transition-colors"
      >
        ✨ Balín
      </button>
      <button
        onClick={() => { onInsertDijon?.(index); setMenuIndex(null) }}
        className="text-left px-3 py-2 text-xs font-semibold text-black hover:bg-zinc-100 rounded-md transition-colors"
      >
        💎 Dije
      </button>
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-100 mt-1">
        {NEOPRENO_COLORS.map(n => (
          <button
            key={n.color}
            onClick={() => { onInsertNeopreno?.(index, n.color, n.label); setMenuIndex(null) }}
            className="size-6 rounded-full border border-zinc-300 hover:scale-110 transition-transform mx-auto"
            style={{ backgroundColor: n.color }}
            title={n.label}
            aria-label={n.label}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-8 px-4 overflow-x-auto no-scrollbar"
        style={{ minHeight: `${beadPx + 60}px` }}
      >
        <div className="flex items-center">
          {hasInsert && (
            <div className="relative flex items-center">
              <button
                onClick={() => setMenuIndex(0)}
                className="size-5 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:bg-yellow-300 transition-colors shadow-md border border-yellow-500 z-10"
                aria-label="Insertar al inicio"
              >
                <Plus className="size-3" />
              </button>
              {menuIndex === 0 && <InsertMenu index={0} />}
            </div>
          )}

          {items.map((item, i) => {
            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt="Balin"
                width={BEAD_IMAGE_SIZES[item.size]}
                height={BEAD_IMAGE_SIZES[item.size]}
                className="block"
                style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt={item.label}
                width={DIJON_VIEW_SIZE}
                height={DIJON_VIEW_SIZE}
                className="block"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt={item.label}
                width={getNeoprenoDisplaySize(beadPx).width}
                height={getNeoprenoDisplaySize(beadPx).height}
                className="block"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
              />
            )

            return (
              <div key={i} className="flex items-center">
                <button
                  type="button"
                  className={`flex items-center outline-none transition-opacity ${onItemClick ? 'cursor-pointer hover:opacity-60' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  style={{ margin: '0 -3px' }}
                  aria-label={item.kind === 'balin' ? `Balín ${item.type}` : item.label}
                >
                  {img}
                </button>
                {hasInsert && (
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setMenuIndex(i + 1)}
                      className="size-5 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:bg-yellow-300 transition-colors shadow-md border border-yellow-500 z-10"
                      aria-label={`Insertar después de la pieza ${i + 1}`}
                    >
                      <Plus className="size-3" />
                    </button>
                    {menuIndex === i + 1 && <InsertMenu index={i + 1} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
