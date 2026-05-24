'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import {
  BEAD_IMAGE_SIZES,
  DIJON_VIEW_SIZE,
  NEOPRENO_VIEW_WIDTH,
  NEOPRENO_VIEW_HEIGHT,
  getBeadImagePath,
} from '@/lib/personalizacion'
import type { SequenceItem, BalinConfig, MaterialName } from '@/lib/personalizacion'

interface DijonViewItem {
  id: string
  image: string
  nombre: string
}

type ViewItem =
  | { kind: 'balin'; data: BalinConfig }
  | { kind: 'dijon'; data: DijonViewItem }
  | { kind: 'neopreno'; data: { color: string; label: string } }

interface BeadSequenceViewerProps {
  items: ViewItem[]
  material?: MaterialName
  onInsertBetween?: (index: number) => void
  onItemClick?: (index: number) => void
}

export default function BeadSequenceViewer({
  items, material = 'gold', onInsertBetween, onItemClick,
}: BeadSequenceViewerProps) {
  const hasInsert = !!onInsertBetween

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
        className="flex items-center justify-center py-4 md:py-6 px-4 overflow-x-auto"
        style={{ minHeight: '100px' }}
      >
        <div className="flex items-center relative">
          {items.map((item, i) => (
            <div key={i} className="flex items-center relative">
              {hasInsert && (
                <button
                  type="button"
                  onClick={() => onInsertBetween(i)}
                  className="absolute -left-2 z-10 size-4 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg opacity-0 hover:opacity-100 group-hover/seq:opacity-50"
                  title="Insertar aquí"
                >
                  <Plus className="size-3" />
                </button>
              )}

              {item.kind === 'balin' ? (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                >
                  <Image
                    src={getBeadImagePath(item.data.type, material, item.data.size)}
                    alt={`Balín ${item.data.type}`}
                    width={BEAD_IMAGE_SIZES[item.data.size]}
                    height={BEAD_IMAGE_SIZES[item.data.size]}
                    className="inline-block"
                    draggable={false}
                  />
                </div>
              ) : item.kind === 'dijon' ? (
                <div
                  className={`flex items-center shrink-0 ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => onItemClick?.(i)}
                >
                  <Image
                    src={item.data.image}
                    alt={item.data.nombre}
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
                  title={`Neopreno: ${item.data.label}`}
                >
                  <div
                    className="rounded-sm border border-white/10"
                    style={{
                      width: NEOPRENO_VIEW_WIDTH,
                      height: NEOPRENO_VIEW_HEIGHT,
                      backgroundColor: item.data.color,
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {hasInsert && (
            <button
              type="button"
              onClick={() => onInsertBetween(items.length)}
              className="size-4 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-125 transition-transform shadow-lg shrink-0 ml-1"
              title="Insertar al final"
            >
              <Plus className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
