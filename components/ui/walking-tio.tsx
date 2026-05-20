'use client'

import { useRef, useEffect, useState } from 'react'

interface Coin {
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
  const particlesRef = useRef<Coin[]>([])
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

    function spawnCoin(x: number, y: number) {
      const rand = Math.random()
      const type = rand > 0.8 ? 'diamond' : (rand > 0.6 ? 'pearl' : 'gold')

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 50,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 6 - 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        size: type === 'gold' ? 20 + Math.random() * 15 : 12 + Math.random() * 8,
        opacity: 1,
        life: 1,
        flip: Math.random() * Math.PI,
        type,
      })
      if (particlesRef.current.length > 50) particlesRef.current.shift()
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

      // Use local non-null references to satisfy TS
      const currentCanvas = canvasRef.current
      const currentCtx = currentCanvas?.getContext('2d')
      if (!currentCanvas || !currentCtx) return

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)

      const vw = currentCanvas.width
      const vh = currentCanvas.height

      const walkCycleDuration = 14
      const progress = (elapsed % walkCycleDuration) / walkCycleDuration
      const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      const xPos = (easeProgress * 1.4 - 0.2) * vw

      const bob = Math.sin(elapsed * 10) * 10
      const squash = 1 + Math.sin(elapsed * 10) * 0.04

      const currentFrameIdx = Math.floor((elapsed * 24) % TOTAL_FRAMES)
      const frame = framesRef.current[currentFrameIdx]

      if (frame && frame.complete) {
        const finalH = vh * 0.48
        const finalW = frame.naturalWidth * (finalH / frame.naturalHeight)
        const drawX = xPos - finalW / 2
        const drawY = (vh - finalH - 80) + bob

        currentCtx.save()
        currentCtx.translate(0, vh - 80)
        currentCtx.scale(1, -0.4)
        currentCtx.globalAlpha = 0.2
        currentCtx.filter = 'blur(4px)'
        currentCtx.drawImage(frame, drawX, - (vh - finalH - 80) + bob, finalW, finalH)
        currentCtx.restore()

        const glow = currentCtx.createRadialGradient(xPos, vh - 80, 0, xPos, vh - 80, finalW * 0.8)
        glow!.addColorStop(0, 'rgba(212, 175, 55, 0.25)')
        glow!.addColorStop(0.5, 'rgba(212, 175, 55, 0.05)')
        glow!.addColorStop(1, 'rgba(212, 175, 55, 0)')
        currentCtx.fillStyle = glow
        currentCtx.beginPath()
        currentCtx.ellipse(xPos, vh - 80, finalW * 0.8, 30, 0, 0, Math.PI * 2)
        currentCtx.fill()

        currentCtx.save()
        currentCtx.translate(xPos, drawY + finalH)
        currentCtx.scale(1, squash)
        currentCtx.translate(-xPos, -(drawY + finalH))
        currentCtx.imageSmoothingEnabled = false
        currentCtx.drawImage(frame, drawX, drawY, finalW, finalH)
        currentCtx.restore()

        if (Math.random() > 0.93) {
          spawnCoin(xPos, drawY + finalH - 30)
        }
        if (Math.random() > 0.97) {
          spawnSparkle(drawX + Math.random() * finalW, drawY + Math.random() * finalH)
        }
      }

      const coins = particlesRef.current
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.2
        c.rotation += c.rotationSpeed
        c.flip += 0.15
        c.life -= 0.008
        c.opacity = Math.max(0, c.life)

        if (c.life <= 0) {
          coins.splice(i, 1)
          continue
        }

        currentCtx.save()
        currentCtx.translate(c.x, c.y)
        currentCtx.rotate(c.rotation)
        currentCtx.scale(Math.cos(c.flip), 1)
        currentCtx.globalAlpha = c.opacity

        if (c.type === 'gold') {
          currentCtx.shadowColor = '#d4af37'
          currentCtx.shadowBlur = 15
          if (moneyImg.complete) {
            currentCtx.drawImage(moneyImg, -c.size / 2, -c.size / 2, c.size, c.size)
          } else {
            currentCtx.fillStyle = '#d4af37'
            currentCtx.beginPath()
            currentCtx.arc(0, 0, c.size / 2, 0, Math.PI * 2)
            currentCtx.fill()
          }
        } else if (c.type === 'diamond') {
          currentCtx.shadowColor = '#fff'
          currentCtx.shadowBlur = 20
          currentCtx.fillStyle = '#e0f7ff'
          currentCtx.beginPath()
          currentCtx.moveTo(0, -c.size/2); currentCtx.lineTo(c.size/2, 0); currentCtx.lineTo(0, c.size/2); currentCtx.lineTo(-c.size/2, 0); currentCtx.closePath();
          currentCtx.fill()
        } else {
          currentCtx.shadowColor = '#fff'
          currentCtx.shadowBlur = 10
          currentCtx.fillStyle = '#fdfbf0'
          currentCtx.beginPath()
          currentCtx.arc(0, 0, c.size / 2, 0, Math.PI * 2)
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[3] pointer-events-none"
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
    />
  )
}
