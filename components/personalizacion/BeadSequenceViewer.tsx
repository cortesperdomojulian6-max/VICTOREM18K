'use client'

import { useMemo } from 'react'
import Image from 'next/image'

interface BeadItem {
  type: 'liso' | 'diamantado'
  size: 'small' | 'medium' | 'large'
}

interface DijonItem {
  id: string
  image: string
  nombre: string
}

type SequenceItem =
  | { kind: 'balin'; data: BeadItem }
  | { kind: 'dijon'; data: DijonItem }

interface BeadSequenceViewerProps {
  items: SequenceItem[]
}

const BEAD_IMAGE_SIZES: Record<string, number> = {
  small: 40,
  medium: 60,
  large: 80,
}

const DIJON_SIZE = 60

function getBeadImage(item: BeadItem): string {
  const sizeMap: Record<string, string> = {
    small: '40px',
    medium: '60px',
    large: '80px',
  }
  const mat = 'dorado'
  return `/assets/images/balines/generados/balin-${item.type}-${mat}-${sizeMap[item.size]}.png`
}

export default function BeadSequenceViewer({ items }: BeadSequenceViewerProps) {
  const totalWidth = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.kind === 'balin') {
        return sum + BEAD_IMAGE_SIZES[item.data.size] + 2
      }
      return sum + DIJON_SIZE + 2
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
                  src={getBeadImage(item.data)}
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
                  width={DIJON_SIZE}
                  height={DIJON_SIZE}
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
