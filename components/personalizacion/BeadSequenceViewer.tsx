'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { BEAD_IMAGE_SIZES, DIJON_VIEW_SIZE, getBeadImagePath } from '@/lib/personalizacion'
import type { BalinConfig, MaterialName } from '@/lib/personalizacion'

interface DijonViewItem {
  id: string
  image: string
  nombre: string
}

type SequenceItem =
  | { kind: 'balin'; data: BalinConfig }
  | { kind: 'dijon'; data: DijonViewItem }

interface BeadSequenceViewerProps {
  items: SequenceItem[]
  material?: MaterialName
}

export default function BeadSequenceViewer({ items, material = 'gold' }: BeadSequenceViewerProps) {
  const totalWidth = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.kind === 'balin') {
        return sum + BEAD_IMAGE_SIZES[item.data.size] + 2
      }
      return sum + DIJON_VIEW_SIZE + 2
    }, 0)
  }, [items])

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
        <div className="flex items-center gap-0.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center shrink-0">
              {item.kind === 'balin' ? (
                <Image
                  src={getBeadImagePath(item.data.type, material, item.data.size)}
                  alt={`Balín ${item.data.type}`}
                  width={BEAD_IMAGE_SIZES[item.data.size]}
                  height={BEAD_IMAGE_SIZES[item.data.size]}
                  className="inline-block"
                  draggable={false}
                />
              ) : (
                <Image
                  src={item.data.image}
                  alt={item.data.nombre}
                  width={DIJON_VIEW_SIZE}
                  height={DIJON_VIEW_SIZE}
                  className="inline-block"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
