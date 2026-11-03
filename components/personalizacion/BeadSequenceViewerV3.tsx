'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; above: boolean } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const hasInsert = !!(onInsertBalin || onInsertDijon || onInsertNeopreno)
  const beadPx = BEAD_IMAGE_SIZES[beadSize]

  // Solape proporcional al tamaño de cada pieza: así se tocan como en una joya real ensartada
  const overlapFor = (item: SequenceItem): number => {
    if (item.kind === 'balin') return Math.max(4, Math.round(BEAD_IMAGE_SIZES[item.size] * 0.15))
    if (item.kind === 'dijon') return Math.max(8, Math.round(DIJON_VIEW_SIZE * 0.16))
    return 8
  }

  const closeMenu = useCallback(() => {
    setMenuIndex(null)
    setMenuPos(null)
  }, [])

  useEffect(() => {
    if (menuIndex === null) return
    const onDocMouseMove = (e: MouseEvent) => {
      const t = e.target as Node
      if (portalRef.current?.contains(t)) return
      if (t instanceof HTMLElement && t.closest('[data-insert-btn]')) return
      closeMenu()
    }
    const onScrollOrResize = () => closeMenu()
    document.addEventListener('mousedown', onDocMouseMove)
    document.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', onDocMouseMove)
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
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-100 mt-0.5">
          {NEOPRENO_COLORS.map(n => (
            <button
              key={n.color}
              onClick={() => { onInsertNeopreno?.(menuIndex, n.color, n.label); closeMenu() }}
              className="size-7 mx-auto rounded-full border border-zinc-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: n.color }}
              title={n.label}
              aria-label={n.label}
            />
          ))}
        </div>
      </motion.div>
    </div>,
    document.body
  )

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
        className="flex items-center justify-center py-8 px-4 overflow-x-auto no-scrollbar"
        style={{ minHeight: `${beadPx + 40}px` }}
      >
        <div className="flex items-center">
          {hasInsert && (
            <button
              onClick={(e) => toggleMenu(0, e)}
              data-insert-btn
              className="relative flex items-center justify-center shrink-0 size-5 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-110 transition-all shadow-md border border-yellow-500 z-10"
              aria-label="Insertar al inicio"
            >
              <Plus className="size-3" />
            </button>
          )}

          {items.map((item, i) => {
            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt={`Balín ${item.type}`}
                width={BEAD_IMAGE_SIZES[item.size]}
                height={BEAD_IMAGE_SIZES[item.size]}
                className="block"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt={item.label}
                width={DIJON_VIEW_SIZE}
                height={DIJON_VIEW_SIZE}
                className="block"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt={item.label}
                width={getNeoprenoDisplaySize(beadPx).width}
                height={getNeoprenoDisplaySize(beadPx).height}
                className="block"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
              />
            )

            return (
              <div key={i} className="flex items-center shrink-0">
                <button
                  type="button"
                  className={`flex items-center outline-none transition-opacity ${onItemClick ? 'cursor-pointer hover:opacity-70' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  style={{ margin: `0 ${-overlapFor(item)}px` }}
                  aria-label={item.kind === 'balin' ? `Balín ${item.type}` : item.label}
                >
                  {img}
                </button>
                {hasInsert && (
                  <button
                    onClick={(e) => toggleMenu(i + 1, e)}
                    data-insert-btn
                    className="relative flex items-center justify-center shrink-0 size-5 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-110 transition-all shadow-md border border-yellow-500 z-10"
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
