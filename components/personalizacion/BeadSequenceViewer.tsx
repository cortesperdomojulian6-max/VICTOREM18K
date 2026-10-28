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
              style={{ backgroundColor: '#FFFF00', color: '#000' }}
              className="size-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg font-bold"
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

  return (
    <div className="w-full relative overflow-hidden bg-zinc-900 rounded-xl border border-zinc-800">
      <div
        ref={containerRef}
        className="flex items-center justify-center py-8 px-4 overflow-x-auto no-scrollbar"
        style={{ minHeight: `${beadPx + 60}px` }}
      >
        <div className="flex items-center justify-center">
          {hasInsert && (
            <div className="relative flex items-center">
              <button 
                onClick={() => setMenuIndex(0)}
                style={{ backgroundColor: '#FFFF00', color: '#000' }}
                className="size-4 rounded-full flex items-center justify-center z-10 hover:bg-yellow-300 transition-colors shadow-md"
              >
                <Plus className="size-2.5" />
              </button>
              {menuIndex === 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-yellow-400 p-3 flex flex-col gap-2 min-w-[140px]" style={{ color: 'black' }}>
                  <div className="text-[10px] font-black text-zinc-500 uppercase text-center mb-1">Agregar pieza</div>
                  <button onClick={() => { onInsertBalin?.(0); setMenuIndex(null) }} className="text-left px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors">✨ Balín</button>
                  <button onClick={() => { onInsertDijon?.(0); setMenuIndex(null) }} className="text-left px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors">💎 Dije</button>
                  <div className="grid grid-cols-4 gap-2 p-1 border-t border-zinc-200 mt-1">
                    {NEOPRENO_COLORS.map(n => (
                      <button 
                        key={n.color} 
                        onClick={() => { onInsertNeopreno?.(0, n.color, n.label); setMenuIndex(null) }}
                        className="size-6 rounded-full border border-zinc-300 hover:scale-110 transition-transform" 
                        style={{ backgroundColor: n.color }}
                        title={n.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {items.map((item, i) => {
            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt="balin"
                width={BEAD_IMAGE_SIZES[item.size]}
                height={BEAD_IMAGE_SIZES[item.size]}
                className="block"
                style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt="dijon"
                width={DIJON_VIEW_SIZE}
                height={DIJON_VIEW_SIZE}
                className="block"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt="neopreno"
                width={getNeoprenoDisplaySize(beadPx).width}
                height={getNeoprenoDisplaySize(beadPx).height}
                className="block"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
              />
            )

            return (
              <div key={i} className="flex items-center">
                <div
                  className={`flex items-center transition-opacity ${onItemClick ? 'cursor-pointer hover:opacity-50' : ''}`}
                  onClick={() => onItemClick?.(i)}
                  style={{ margin: '0 -8px' }} 
                >
                  {img}
                </div>
                {hasInsert && (
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => setMenuIndex(i + 1)}
                      style={{ backgroundColor: '#FFFF00', color: '#000' }}
                      className="size-4 rounded-full flex items-center justify-center z-10 hover:bg-yellow-300 transition-colors shadow-md"
                    >
                      <Plus className="size-2.5" />
                    </button>
                    {menuIndex === i + 1 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-yellow-400 p-3 flex flex-col gap-2 min-w-[140px]" style={{ color: 'black' }}>
                        <div className="text-[10px] font-black text-zinc-500 uppercase text-center mb-1">Agregar pieza</div>
                        <button onClick={() => { onInsertBalin?.(i + 1); setMenuIndex(null) }} className="text-left px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors">✨ Balín</button>
                        <button onClick={() => { onInsertDijon?.(i + 1); setMenuIndex(null) }} className="text-left px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors">💎 Dije</button>
                        <div className="grid grid-cols-4 gap-2 p-1 border-t border-zinc-200 mt-1">
                          {NEOPRENO_COLORS.map(n => (
                            <button 
                              key={n.color} 
                              onClick={() => { onInsertNeopreno?.(i + 1, n.color, n.//Lógica simplificada para evitar errores
                              n.label); setMenuIndex(null) }}
                              className="size-6 rounded-full border border-zinc-300 hover:scale-110 transition-transform" 
                              style={{ backgroundColor: n.color }}
                              title={n.label}
                            />
                          ))}
                        </div>
                      </div>
                    )}
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