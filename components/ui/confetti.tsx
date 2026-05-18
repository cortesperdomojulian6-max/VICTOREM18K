'use client'

import { useEffect, useRef } from 'react'

interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rotationSpeed: number; alpha: number
}

const COLORS = ['#d4af37', '#f0d060', '#c49b2e', '#fff4c2', '#e8c860']

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let particles: ConfettiParticle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 4 + 3,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
    }))

    let animId: number
    let start = Date.now()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.05
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.alpha -= 0.003

        if (p.alpha <= 0) continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }

      ctx.globalAlpha = 1

      if (Date.now() - start < 4000) {
        animId = requestAnimationFrame(draw)
      }
    }

    animId = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(animId)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      aria-hidden="true"
    />
  )
}
