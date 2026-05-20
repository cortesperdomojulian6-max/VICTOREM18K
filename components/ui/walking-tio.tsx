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
}

export function WalkingTioRico() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const particlesRef = useRef<Coin[]>([])
  const posRef = useRef({ x: 0, dir: 1 })
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

    const TOTAL_FRAMES = 120
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

    const NUM_COINS = 35
    let startTime = Date.now()
    let animId = 0

    function spawnCoin(x: number, y: number) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: 18 + Math.random() * 12,
        opacity: 1,
        life: 1,
      })
      if (particlesRef.current.length > NUM_COINS) {
        particlesRef.current.shift()
      }
    }

    function render() {
      const elapsed = (Date.now() - startTime) / 1000
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const vw = canvas!.width
      const vh = canvas!.height

      const progress = (elapsed % 15) / 15
      const xPos = (progress * 1.2 - 0.1) * vw
      posRef.current.x = xPos
      posRef.current.dir = 1

      const currentFrameIdx = Math.floor((elapsed * 24) % TOTAL_FRAMES)
      const frame = framesRef.current[currentFrameIdx]

      if (frame && frame.complete) {
        const finalH = vh * 0.45
        const finalW = frame.naturalWidth * (finalH / frame.naturalHeight)
        const drawX = xPos - finalW / 2
        const drawY = vh - finalH - 50

        ctx!.save()
        ctx!.imageSmoothingEnabled = false
        ctx!.drawImage(frame, drawX, drawY, finalW, finalH)
        ctx!.restore()

        if (Math.random() > 0.92) {
          spawnCoin(xPos, drawY + finalH - 10)
        }
      }

      const coins = particlesRef.current
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.15
        c.rotation += c.rotationSpeed
        c.life -= 0.007
        c.opacity = Math.max(0, c.life)

        if (c.life <= 0) {
          coins.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.translate(c.x, c.y)
        ctx!.rotate(c.rotation)
        ctx!.globalAlpha = c.opacity
        ctx!.shadowColor = '#d4af37'
        ctx!.shadowBlur = 8

        if (moneyImg.complete) {
          ctx!.drawImage(moneyImg, -c.size / 2, -c.size / 2, c.size, c.size)
        } else {
          ctx!.fillStyle = '#d4af37'
          ctx!.beginPath()
          ctx!.arc(0, 0, c.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()
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
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}
    />
  )
}
