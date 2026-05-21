'use client'

import { useRef, useEffect, useState } from 'react'

interface Jewelry {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  life: number
  flip: number
  type: 'gold' | 'diamond' | 'pearl'
}

interface Sparkle {
  x: number
  y: number
  size: number
  opacity: number
  life: number
  rot: number
}

export function WalkingTioRico() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const particlesRef = useRef<Jewelry[]>([])
  const sparklesRef = useRef<Sparkle[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const TOTAL_FRAMES = 121
    const frameImages: HTMLImageElement[] = []
    let loadedCount = 0

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/assets/images/animacion/frames/frame_${String(i).padStart(3, '0')}.png`
      img.onload = () => {
        loadedCount++
        if (loadedCount === TOTAL_FRAMES) setLoaded(true)
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount === TOTAL_FRAMES) setLoaded(true)
      }
      frameImages.push(img)
    }
    framesRef.current = frameImages

    const moneyImg = new Image()
    moneyImg.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#d4af37" stroke="#b8960c" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-size="40" font-weight="bold" fill="#b8960c" font-family="serif">$</text></svg>')

    let startTime = Date.now()
    let animId = 0

    function spawnJewelry(x: number, y: number) {
      const rand = Math.random()
      const type = rand > 0.8 ? 'diamond' : (rand > 0.6 ? 'pearl' : 'gold')

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 60,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 7 - 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        size: type === 'gold' ? 22 + Math.random() * 15 : 14 + Math.random() * 8,
        opacity: 1,
        life: 1,
        flip: Math.random() * Math.PI,
        type,
      })
      if (particlesRef.current.length > 60) particlesRef.current.shift()
    }

    function spawnSparkle(x: number, y: number) {
      sparklesRef.current.push({
        x, y,
        size: Math.random() * 4 + 2,
        opacity: 1,
        life: 1,
        rot: Math.random() * Math.PI * 2
      })
    }

    function render() {
      const elapsed = (Date.now() - startTime) / 1000

      const currentCanvas = canvasRef.current
      const currentCtx = currentCanvas?.getContext('2d')
      if (!currentCanvas || !currentCtx) return

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)

      const vw = currentCanvas.width
      const vh = currentCanvas.height

      const currentFrameIdx = Math.floor((elapsed * 24) % TOTAL_FRAMES)
      const frame = framesRef.current[currentFrameIdx]

      if (frame && frame.complete) {
        const finalH = vh * 0.48
        const finalW = frame.naturalWidth * (finalH / frame.naturalHeight)

        const drawX = (vw / 2) - (finalW / 2)
        const drawY = (vh - finalH - 80)

        const bob = Math.sin(elapsed * 10) * 10
        const squash = 1 + Math.sin(elapsed * 10) * 0.04

        currentCtx.save()
        currentCtx.translate(0, vh - 80)
        currentCtx.scale(1, -0.4)
        currentCtx.globalAlpha = 0.2
        currentCtx.filter = 'blur(6px)'
        currentCtx.drawImage(frame, drawX, - (vh - finalH - 80), finalW, finalH)
        currentCtx.restore()

        const glow = currentCtx.createRadialGradient(vw / 2, vh - 80, 0, vw / 2, vh - 80, finalW * 0.8)
        glow!.addColorStop(0, 'rgba(212, 175, 55, 0.2)')
        glow!.addColorStop(1, 'rgba(212, 175, 55, 0)')
        currentCtx.fillStyle = glow
        currentCtx.beginPath()
        currentCtx.ellipse(vw / 2, vh - 80, finalW * 0.8, 30, 0, 0, Math.PI * 2)
        currentCtx.fill()

        currentCtx.save()
        currentCtx.translate(vw / 2, drawY + finalH + bob)
        currentCtx.scale(1, squash)
        currentCtx.translate(-vw / 2, -(drawY + finalH + bob))
        currentCtx.imageSmoothingEnabled = false
        currentCtx.drawImage(frame, drawX, drawY + bob, finalW, finalH)
        currentCtx.restore()

        if (Math.random() > 0.93) {
          spawnJewelry(vw / 2, drawY + finalH - 30)
        }
        if (Math.random() > 0.97) {
          spawnSparkle(drawX + Math.random() * finalW, drawY + Math.random() * finalH)
        }
      }

      const jewels = particlesRef.current
      for (let i = jewels.length - 1; i >= 0; i--) {
        const j = jewels[i]
        j.x += j.vx
        j.y += j.vy
        j.vy += 0.22
        j.rotation += j.rotationSpeed
        j.flip += 0.18
        j.life -= 0.008
        j.opacity = Math.max(0, j.life)

        if (j.life <= 0) {
          jewels.splice(i, 1)
          continue
        }

        currentCtx.save()
        currentCtx.translate(j.x, j.y)
        currentCtx.rotate(j.rotation)
        currentCtx.scale(Math.cos(j.flip), 1)
        currentCtx.globalAlpha = j.opacity

        if (j.type === 'gold') {
          currentCtx.shadowColor = '#d4af37'
          currentCtx.shadowBlur = 15
          if (moneyImg.complete) {
            currentCtx.drawImage(moneyImg, -j.size / 2, -j.size / 2, j.size, j.size)
          } else {
            currentCtx.fillStyle = '#d4af37'
            currentCtx.beginPath()
            currentCtx.arc(0, 0, j.size / 2, 0, Math.PI * 2)
            currentCtx.fill()
          }
        } else if (j.type === 'diamond') {
          currentCtx.shadowColor = '#fff'
          currentCtx.shadowBlur = 20
          currentCtx.fillStyle = '#fff'
          currentCtx.beginPath()
          currentCtx.moveTo(0, -j.size/2); currentCtx.lineTo(j.size/2, 0); currentCtx.lineTo(0, j.size/2); currentCtx.lineTo(-j.size/2, 0); currentCtx.closePath();
          currentCtx.fill()
        } else {
          currentCtx.shadowColor = '#fff'
          currentCtx.shadowBlur = 10
          currentCtx.fillStyle = '#fdfbf0'
          currentCtx.beginPath()
          currentCtx.arc(0, 0, j.size / 2, 0, Math.PI * 2)
          currentCtx.fill()
        }
        currentCtx.restore()
      }

      const sparkles = sparklesRef.current
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.life -= 0.02
        if (s.life <= 0) {
          sparkles.splice(i, 1)
          continue
        }
        currentCtx.save()
        currentCtx.globalAlpha = s.life
        currentCtx.shadowColor = '#fff'
        currentCtx.shadowBlur = 10
        currentCtx.fillStyle = '#fff'
        currentCtx.translate(s.x, s.y)
        currentCtx.rotate(s.rot)
        currentCtx.fillRect(-s.size/2, -s.size/2, s.size, s.size)
        currentCtx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          filter: 'contrast(1.1) brightness(1.1) saturate(1.2)'
        }}
      />
    </div>
  )
}
