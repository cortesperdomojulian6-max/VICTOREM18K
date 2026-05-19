'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number; y: number; alpha: number; size: number
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      dotsRef.current.push({
        x: mouseRef.current.x,
        y: mouseRef.current.y,
        alpha: 0.6,
        size: Math.random() * 3 + 2,
      })

      if (dotsRef.current.length > 25) {
        dotsRef.current = dotsRef.current.slice(-25)
      }

      for (const dot of dotsRef.current) {
        dot.alpha *= 0.92
        dot.size *= 0.98

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${dot.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    />
  )
}
