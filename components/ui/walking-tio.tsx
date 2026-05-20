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
}

interface Dust {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export function WalkingTioRico() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const coinsRef = useRef<Coin[]>([])
  const dustRef = useRef<Dust[]>([])
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

    for (let i = 0; i < 50; i++) {
      dustRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5,
      })
    }

    let startTime = Date.now()
    let animId = 0

    function spawnCoin(x: number, y: number) {
      coinsRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 5 - 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        size: 20 + Math.random() * 15,
        opacity: 1,
        life: 1,
        flip: Math.random() * Math.PI,
      })
      if (coinsRef.current.length > 40) coinsRef.current.shift()
    }

    function render() {
      const elapsed = (Date.now() - startTime) / 1000
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const vw = canvas!.width
      const vh = canvas!.height

      const progress = (elapsed % 12) / 12
      const xPos = (progress * 1.3 - 0.15) * vw

      const bob = Math.sin(elapsed * 12) * 8
      const squash = 1 + Math.sin(elapsed * 12) * 0.03

      const currentFrameIdx = Math.floor((elapsed * 24) % TOTAL_FRAMES)
      const frame = framesRef.current[currentFrameIdx]

      ctx!.globalCompositeOperation = 'screen'
      dustRef.current.forEach(d => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0 || d.x > vw) d.vx *= -1
        if (d.y < 0 || d.y > vh) d.vy *= -1
        ctx!.fillStyle = `rgba(212, 175, 55, ${d.opacity})`
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx!.fill()
      })
      ctx!.globalCompositeOperation = 'source-over'

      if (frame && frame.complete) {
        const finalH = vh * 0.45
        const finalW = frame.naturalWidth * (finalH / frame.naturalHeight)
        const drawX = xPos - finalW / 2
        const drawY = (vh - finalH - 60) + bob

        const shadowW = finalW * 0.7 * (1 - bob * 0.005)
        const shadowH = finalH * 0.15
        const shadowGrad = ctx!.createRadialGradient(xPos, vh - 60, 0, xPos, vh - 60, shadowW / 2)
        shadowGrad!.addColorStop(0, 'rgba(0,0,0,0.6)')
        shadowGrad!.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = shadowGrad
        ctx!.beginPath()
        ctx!.ellipse(xPos, vh - 60, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2)
        ctx!.fill()

        const floorGlow = ctx!.createRadialGradient(xPos, vh - 60, 0, xPos, vh - 60, finalW * 0.6)
        floorGlow!.addColorStop(0, 'rgba(212, 175, 55, 0.2)')
        floorGlow!.addColorStop(1, 'rgba(212, 175, 55, 0)')
        ctx!.fillStyle = floorGlow
        ctx!.beginPath()
        ctx!.ellipse(xPos, vh - 60, finalW * 0.6, shadowH * 2, 0, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.save()
        ctx!.translate(xPos, drawY + finalH)
        ctx!.scale(1, squash)
        ctx!.translate(-xPos, -(drawY + finalH))
        ctx!.imageSmoothingEnabled = false
        ctx!.drawImage(frame, drawX, drawY, finalW, finalH)
        ctx!.restore()

        if (Math.random() > 0.94) {
          spawnCoin(xPos, drawY + finalH - 20)
        }
      }

      const coins = coinsRef.current
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.18
        c.rotation += c.rotationSpeed
        c.flip += 0.1
        c.life -= 0.006
        c.opacity = Math.max(0, c.life)

        if (c.life <= 0) {
          coins.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.translate(c.x, c.y)
        ctx!.rotate(c.rotation)
        ctx!.scale(Math.cos(c.flip), 1)
        ctx!.globalAlpha = c.opacity
        ctx!.shadowColor = '#d4af37'
        ctx!.shadowBlur = 12

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
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease-in' }}
    />
  )
}
