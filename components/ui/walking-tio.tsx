'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface Particle {
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
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const posRef = useRef({ x: 0, dir: 1 })
  const moneyIconRef = useRef<HTMLImageElement | null>(null)

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const video = document.createElement('video')
    video.src = '/assets/images/animacion/PixVerse_V6_Image_Text_360P_necesito_al_tio_ri.mp4'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    videoRef.current = video

    video.addEventListener('canplay', () => {
      video.play()
      setLoaded(true)
    })

    const moneyImg = new Image()
    moneyImg.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#d4af37" stroke="#b8960c" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-size="40" font-weight="bold" fill="#b8960c" font-family="serif">$</text></svg>')
    moneyIconRef.current = moneyImg

    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })

    const WALK_SPEED = 0.25
    const SCALE = 0.35
    const NUM_PARTICLES = 30
    let startTime = Date.now()
    let animId = 0

    function spawnParticle(x: number, y: number) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 60,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4 - 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: 16 + Math.random() * 20,
        opacity: 1,
        life: 1,
      })
      if (particlesRef.current.length > NUM_PARTICLES) {
        particlesRef.current.shift()
      }
    }

    function render() {
      const elapsed = (Date.now() - startTime) / 1000

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const vw = canvas.width
      const vh = canvas.height

      posRef.current.x = Math.sin(elapsed * WALK_SPEED) * vw * 0.32 + vw * 0.5
      posRef.current.dir = Math.cos(elapsed * WALK_SPEED) > 0 ? 1 : -1

      if (video.readyState >= 2 && offCtx) {
        const vwVideo = video.videoWidth || 640
        const vhVideo = video.videoHeight || 360
        offscreen.width = vwVideo
        offscreen.height = vhVideo

        offCtx.drawImage(video, 0, 0, vwVideo, vhVideo)

        const imageData = offCtx.getImageData(0, 0, vwVideo, vhVideo)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]

          const isDark = r < 50 && g < 50 && b < 50
          const isBg = r < 90 && g < 90 && b < 90 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20
          const isGreenScreen = g > 100 && g > r + 40 && g > b + 40

          if (isDark || isBg || isGreenScreen) {
            data[i + 3] = 0
          } else {
            const brightBoost = Math.min(1, (255 - Math.max(r, g, b)) / 100)
            data[i] = Math.min(255, r + 20)
            data[i + 1] = Math.min(255, g + 15)
            data[i + 2] = Math.min(255, b + 10)
          }
        }

        offCtx.putImageData(imageData, 0, 0)

        const drawW = vwVideo * SCALE
        const drawH = vhVideo * SCALE
        const drawX = posRef.current.x - drawW / 2
        const drawY = vh - drawH - 40

        ctx.save()
        if (posRef.current.dir < 0) {
          ctx.translate(drawX + drawW / 2, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(offscreen, -drawW / 2, drawY, drawW, drawH)
        } else {
          ctx.drawImage(offscreen, drawX, drawY, drawW, drawH)
        }
        ctx.restore()

        if (Math.sin(elapsed * WALK_SPEED * 4) > 0.7) {
          spawnParticle(posRef.current.x, drawY + 20)
        }
      }

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15
        p.rotation += p.rotationSpeed
        p.life -= 0.008
        p.opacity = Math.max(0, p.life)

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity * 0.9

        if (moneyImg.complete) {
          ctx.drawImage(moneyImg, -p.size / 2, -p.size / 2, p.size, p.size)
        } else {
          ctx.fillStyle = '#d4af37'
          ctx.shadowColor = '#d4af37'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      video.pause()
      video.remove()
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
