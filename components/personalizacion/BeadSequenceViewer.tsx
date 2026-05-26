'use client'

import Image from 'next/image'
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
  onItemClick?: (index: number) => void
}

export default function BeadSequenceViewer({
  items,
  material = 'gold',
  beadSize = 'medium',
  onItemClick,
}: BeadSequenceViewerProps) {
  const beadPx = BEAD_IMAGE_SIZES[beadSize]

  if (items.length === 0) {
    return (
      <div className="w-full h-16 relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl flex items-center justify-center">
        <div className="text-white/15 text-[10px] uppercase tracking-widest">
          Secuencia vacía
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl">
      <div
        className="flex items-center justify-center py-1 px-2 overflow-x-auto"
      >
        <div className="flex items-center" style={{ gap: 0 }}>
          {items.map((item, i) => {
            const img = item.kind === 'balin' ? (
              <Image
                src={getBeadImagePath(item.type, material, item.size)}
                alt=""
                width={BEAD_IMAGE_SIZES[item.size]}
                height={BEAD_IMAGE_SIZES[item.size]}
                draggable={false}
                className="pointer-events-none"
                style={{ display: 'block', filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.4))' }}
              />
            ) : item.kind === 'dijon' ? (
              <Image
                src={item.image}
                alt=""
                width={DIJON_VIEW_SIZE}
                height={DIJON_VIEW_SIZE}
                draggable={false}
                className="pointer-events-none"
                style={{ display: 'block', filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.5))' }}
              />
            ) : (
              <Image
                src={getNeoprenoImage(item.color)!}
                alt=""
                width={getNeoprenoDisplaySize(beadPx).width}
                height={getNeoprenoDisplaySize(beadPx).height}
                draggable={false}
                className="pointer-events-none"
                style={{ display: 'block', filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.5))' }}
              />
            )

            return (
              <div
                key={`${item.kind}-${i}`}
                onClick={() => onItemClick?.(i)}
                title={onItemClick ? 'Clic para eliminar' : undefined}
                style={{ display: 'flex', alignItems: 'center', cursor: onItemClick ? 'pointer' : undefined }}
              >
                {img}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}