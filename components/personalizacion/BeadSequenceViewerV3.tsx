'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import {
  BEAD_IMAGE_SIZES,
  NEOPRENO_COLORS,
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
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; above: boolean } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const hasInsert = !!(onInsertBalin || onInsertDijon || onInsertNeopreno)
  const beadPx = BEAD_IMAGE_SIZES[beadSize]

  const closeMenu = useCallback(() => {
    setMenuIndex(null)
    setMenuPos(null)
  }, [])

  useEffect(() => {
    if (menuIndex === null) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (portalRef.current?.contains(t)) return
      if (t instanceof HTMLElement && t.closest('[data-insert-btn]')) return
      closeMenu()
    }
    const onScrollOrResize = () => closeMenu()
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [menuIndex, closeMenu])

  const toggleMenu = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (menuIndex === index) {
      closeMenu()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const menuW = 180
    const x = Math.min(Math.max(rect.left + rect.width / 2, menuW / 2 + 8), window.innerWidth - menuW / 2 - 8)
    const spaceBelow = window.innerHeight - rect.bottom
    const above = spaceBelow < 220
    const y = above ? rect.top - 8 : rect.bottom + 8
    setMenuPos({ x, y, above })
    setMenuIndex(index)
  }

  const insertMenuPanel = (menuIndex !== null && menuPos && hasInsert) && createPortal(
    <div
      ref={portalRef}
      style={{
        position: 'fixed',
        left: menuPos.x,
        top: menuPos.y,
        transform: menuPos.above ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%)',
        zIndex: 60,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: menuPos.above ? 5 : -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ transformOrigin: menuPos.above ? 'bottom center' : 'top center' }}
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-3 flex flex-col gap-1 min-w-[168px]"
      >
        <div className="text-[10px] font-bold text-zinc-400 uppercase text-center mb-0.5">Agregar pieza</div>
        <button
          onClick={() => { onInsertBalin?.(menuIndex); closeMenu() }}
          className="text-left px-3 py-2 text-xs font-semibold text-black hover:bg-zinc-100 rounded-md transition-colors"
        >
          ✨ Balín
        </button>
        <button
          onClick={() => { onInsertDijon?.(menuIndex); closeMenu() }}
          className="text-left px-3 py-2 text-xs font-semibold text-black hover:bg-zinc-100 rounded-md transition-colors"
        >
          💎 Dije
        </button>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 mt-0.5">
          {NEOPRENO_COLORS.map(n => (
            <button
              key={n.color}
              onClick={() => { onInsertNeopreno?.(menuIndex, n.color, n.label); closeMenu() }}
              className="mx-auto rounded-md border border-zinc-200 overflow-hidden bg-zinc-100 hover:scale-110 hover:border-yellow-500 transition-all"
              title={n.label}
              aria-label={n.label}
            >
              <Image
                src={n.image}
                alt={n.label}
                width={32}
                height={32}
                className="block object-contain"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    document.body
  )

  // El dije se dimensiona segun su vecino: ~135% del tamano de la pieza al lado
  const dijonNeighborSize = (i: number): number => {
    for (let j = i - 1; j >= 0; j--) {
      const nb = items[j]
      if (nb.kind === 'balin') return Math.round(BEAD_IMAGE_SIZES[nb.size] * 1.35)
      if (nb.kind === 'neopreno') return Math.round(beadPx * 1.35)
      if (nb.kind === 'dijon') {
        for (let k = j - 1; k >= 0; k--) {
          const b2 = items[k]
          if (b2.kind === 'balin') return Math.round(BEAD_IMAGE_SIZES[b2.size] * 1.35)
          if (b2.kind === 'neopreno') return Math.round(beadPx * 1.35)
        }
        for (let k = j + 1; k < items.length; k++) {
          const b2 = items[k]
          if (b2.kind === 'balin') return Math.round(BEAD_IMAGE_SIZES[b2.size] * 1.35)
          if (b2.kind === 'neopreno') return Math.round(beadPx * 1.35)
        }
      }
    }
    for (let j = i + 1; j < items.length; j++) {
      const nb = items[j]
      if (nb.kind === 'balin') return Math.round(BEAD_IMAGE_SIZES[nb.size] * 1.35)
      if (nb.kind === 'neopreno') return Math.round(beadPx * 1.35)
    }
    return Math.round(beadPx * 1.35)
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-24 relative bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
        {hasInsert ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Secuencia vacía</span>
            <button
              onClick={(e) => toggleMenu(0, e)}
              data-insert-btn
              className="size-6 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              aria-label="Agregar primera pieza"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Secuencia vacía</span>
        )}
        {insertMenuPanel}
      </div>
    )
  }

  return (
    <div className="w-full relative bg-zinc-900 rounded-xl border border-zinc-800">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-8 px-6 overflow-x-auto no-scrollbar"
        style={{ minHeight: `${beadPx + 40}px` }}
      >
        <div className="flex items-center">
          {items.map((item, i) => {
            const size = item.kind === 'balin'
              ? BEAD_IMAGE_SIZES[item.size]
              : item.kind === 'dijon'
                ? dijonNeighborSize(i)
                : beadPx

            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt={`Balín ${item.type}`}
                width={size}
                height={size}
                className="block"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt={item.label}
                width={size}
                height={size}
                className="block"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt={item.label}
                width={size}
                height={size}
                className="block"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
              />
            )

            return (
              <div
                key={i}
                className="relative flex items-center"
                style={{ margin: '0 -2px' }}
              >
                {hasInsert && i === 0 && (
                  <button
                    onClick={(e) => toggleMenu(0, e)}
                    data-insert-btn
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center size-5 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-110 transition-all shadow-md border border-yellow-500 z-10"
                    aria-label="Insertar al inicio"
                  >
                    <Plus className="size-3" />
                  </button>
                )}

                <button
                  type="button"
                  className={`flex items-center outline-none transition-opacity ${onItemClick ? 'cursor-pointer hover:opacity-70' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  aria-label={item.kind === 'balin' ? `Balín ${item.type}` : item.label}
                >
                  {img}
                </button>

                {hasInsert && (
                  <button
                    onClick={(e) => toggleMenu(i + 1, e)}
                    data-insert-btn
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center size-5 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-110 transition-all shadow-md border border-yellow-500 z-10"
                    aria-label={`Insertar después de la pieza ${i + 1}`}
                  >
                    <Plus className="size-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {insertMenuPanel}
    </div>
  )
}
