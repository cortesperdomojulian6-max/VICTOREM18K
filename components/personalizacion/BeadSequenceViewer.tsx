'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Plus, X } from 'lucide-react'
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

export default function BeadSequenceViewer({
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
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [menuIndex, closeMenu])

  const InsertButton = ({ index }: { index: number }) => {
    const open = menuIndex === index
    return (
      <div className="relative shrink-0 flex items-center">
        <button
          type="button"
          onClick={() => setMenuIndex(open ? null : index)}
          className={`size-4 rounded-full flex items-center justify-center transition-all shadow-lg z-10 ${
            open ? 'bg-gold-400 text-ebony scale-110' : 'bg-gold-400/80 text-ebony hover:bg-gold-400 hover:scale-110'
          }`}
          title="Insertar aquí"
          aria-label={`Insertar antes de la pieza ${index + 1}`}
        >
          {open ? <X className="size-2.5" /> : <Plus className="size-3" />}
        </button>
        {open && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 bg-elevated rounded-lg shadow-xl border border-subtle p-1.5 flex flex-col gap-1 min-w-[110px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { onInsertBalin?.(index); closeMenu() }}
              className="text-[10px] px-2 py-1 rounded bg-surface hover:bg-gold-400/10 text-primary transition-colors whitespace-nowrap font-medium text-left"
            >
              Balín
            </button>
            <button
              type="button"
              onClick={() => { onInsertDijon?.(index); closeMenu() }}
              className="text-[10px] px-2 py-1 rounded bg-surface hover:bg-gold-400/10 text-primary transition-colors whitespace-nowrap font-medium text-left"
            >
              Dije
            </button>
            <div className="flex items-center gap-1 px-1 pt-1 border-t border-border">
              {NEOPRENO_COLORS.map((n) => (
                <button
                  key={n.color}
                  type="button"
                  onClick={() => { onInsertNeopreno?.(index, n.color, n.label); closeMenu() }}
                  className="flex flex-col items-center gap-0.5 px-1 py-0.5 rounded hover:bg-gold-400/10 transition-colors"
                  title={`Neopreno ${n.label}`}
                >
                  {n.image ? (
                    <Image src={n.image} alt={n.label} width={24} height={12} className="shrink-0" />
                  ) : (
                    <span className="block size-4 rounded-sm border border-black/10" style={{ backgroundColor: n.color }} />
                  )}
                  <span className="text-[8px] text-muted leading-none">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-20 relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl flex items-center justify-center">
        {hasInsert ? (
          <div className="flex items-center gap-3">
            <span className="text-white/25 text-[10px] uppercase tracking-widest">Secuencia vacía</span>
            <InsertButton index={0} />
          </div>
        ) : (
          <div className="text-white/15 text-[10px] uppercase tracking-widest">Secuencia vacía</div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-3 px-4 overflow-x-auto"
        style={{ minHeight: `${beadPx + 24}px` }}
      >
        <div className="flex items-center" style={{ gap: hasInsert ? 12 : 6 }}>
          {hasInsert && <InsertButton index={0} />}
          {items.map((item, i) => {
            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt={`Balín ${item.type}`}
                width={BEAD_IMAGE_SIZES[item.size]}
                height={BEAD_IMAGE_SIZES[item.size]}
                draggable={false}
                className="pointer-events-none"
                style={{ display: 'block', filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.4))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt={item.label}
                width={DIJON_VIEW_SIZE}
                height={DIJON_VIEW_SIZE}
                draggable={false}
                className="pointer-events-none"
                title={item.label}
                style={{ display: 'block', filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.5))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt={`Neopreno ${item.label}`}
                width={getNeoprenoDisplaySize(beadPx).width}
                height={getNeoprenoDisplaySize(beadPx).height}
                draggable={false}
                className="pointer-events-none"
                title={`Neopreno ${item.label}`}
                style={{ display: 'block', filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.5))' }}
/>
            )

            return (
              <div key={`${item.kind}-${i}`} className="flex items-center" style={{ gap: hasInsert ? 12 : 6 }}>
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  title={onItemClick ? 'Clic para eliminar' : undefined}
                >
                  {img}
                </div>
                {hasInsert && <InsertButton index={i + 1} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
