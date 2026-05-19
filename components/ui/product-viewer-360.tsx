'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface ProductViewer360Props {
  imageUrl: string | null
  name: string
  balines?: number
  dije?: string
  color?: string
}

export function ProductViewer360({ imageUrl, name, balines, dije, color }: ProductViewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const lastX = useRef(0)
  const currentRotation = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    lastX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const delta = e.clientX - lastX.current
    currentRotation.current = currentRotation.current + delta * 0.5
    setRotation(currentRotation.current)
    lastX.current = e.clientX
  }, [isDragging])

  const onPointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) return
    const interval = setInterval(() => {
      currentRotation.current += 0.2
      setRotation(currentRotation.current)
    }, 30)
    return () => clearInterval(interval)
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square cursor-grab active:cursor-grabbing overflow-hidden bg-gradient-to-b from-stone-100 to-white"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ perspective: '1200px' }}
    >
      <div
        className="w-full h-full transition-transform duration-75"
        style={{
          transform: `rotateY(${rotation}deg) scale(1.05)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-8"
            draggable={false}
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone text-sm">
            Sin imagen
          </div>
        )}

        {balines && Array.from({ length: balines }).map((_, i) => {
          const angle = (i / balines) * Math.PI * 2
          const r = 30
          const x = 50 + Math.cos(angle) * r
          const y = 50 + Math.sin(angle) * r
          return (
            <div
              key={i}
              className="absolute size-3 rounded-full shadow-md"
              style={{
                left: `${x}%`, top: `${y}%`,
                backgroundColor: color || '#d4af37',
                transform: `translate(-50%, -50%) rotateY(${-rotation}deg)`,
              }}
            />
          )
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {['#d4af37', '#c0c0c0', '#e8a0b4', '#1a1a1a'].map((c) => (
          <button
            key={c}
            onClick={(e) => { e.stopPropagation(); /* color select handled by parent */ }}
            className="size-4 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125"
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      <div className="absolute top-3 right-3 text-[10px] text-stone/40 select-none bg-white/60 px-2 py-1">
        Arrastra para rotar 360°
      </div>
    </div>
  )
}
