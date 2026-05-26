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
        className="flex items-center justify-center py-2 px-4 overflow-x-auto"
        style={{ minHeight: `${beadPx + 16}px` }}
      >
        <div className="flex items-center" style={{ gap: '1px' }}>
          {items.map((item, i) => (
            <div
              key={`${item.kind}-${i}`}
              className={`flex items-center shrink-0 ${
                onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
              onClick={() => onItemClick?.(i)}
              style={{ margin: 0, padding: 0, lineHeight: 0 }}
            >
              {item.kind === 'balin' ? (
                <Image
                  src={getBeadImagePath(item.type, material, item.size)}
                  alt={`Balín ${item.type}`}
                  width={BEAD_IMAGE_SIZES[item.size]}
                  height={BEAD_IMAGE_SIZES[item.size]}
                  draggable={false}
                  style={{ display: 'block' }}
                  className="inline-block"
                />
              ) : item.kind === 'dijon' ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  width={DIJON_VIEW_SIZE}
                  height={DIJON_VIEW_SIZE}
                  draggable={false}
                  style={{ display: 'block' }}
                  className="inline-block"
                />
              ) : (
                <Image
                  src={getNeoprenoImage(item.color)!}
                  alt={item.label}
                  width={getNeoprenoDisplaySize(beadPx).width}
                  height={getNeoprenoDisplaySize(beadPx).height}
                  draggable={false}
                  style={{ display: 'block' }}
                  className="inline-block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}