'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const steps = [
  {
    title: 'La Memoria del Oro',
    description: 'Todo comienza con una lámina de oro laminado 18K. El oro es maleable, pero tiene memoria. Nuestro trabajo es convencerlo de tomar una nueva forma sin perder su fuerza.',
  },
  {
    title: 'El Balín Perfecto',
    description: 'Cada esfera es forjada y pulida hasta alcanzar un brillo espejo. No aceptamos imperfecciones; la geometría debe ser exacta para reflejar la luz desde cualquier ángulo.',
  },
  {
    title: 'El Tejido a Mano',
    description: 'Nuestros artesanos unen cada balín con precisión matemática. Una danza de tensión y paciencia que transforma las esferas individuales en una pieza inquebrantable.',
  },
]

export function ArtisanProcess() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const step0Opacity = useTransform(scrollYProgress, [0, 0.1, 0.23, 0.33], [0, 1, 1, 0])
  const step0Y = useTransform(scrollYProgress, [0, 0.1, 0.23, 0.33], [40, 0, 0, -40])
  const step1Opacity = useTransform(scrollYProgress, [0.33, 0.43, 0.57, 0.67], [0, 1, 1, 0])
  const step1Y = useTransform(scrollYProgress, [0.33, 0.43, 0.57, 0.67], [40, 0, 0, -40])
  const step2Opacity = useTransform(scrollYProgress, [0.67, 0.77, 0.9, 1], [0, 1, 1, 0])
  const step2Y = useTransform(scrollYProgress, [0.67, 0.77, 0.9, 1], [40, 0, 0, -40])

  const step1VisOpacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0])
  const step1Scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  const step1ScaleX = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  const visStep2Opacity = useTransform(scrollYProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0])
  const visStep2Scale = useTransform(scrollYProgress, [0.25, 0.5], [0.5, 1])

  const visStep3Opacity = useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1])

  const circleY0 = useTransform(scrollYProgress, [0.7, 1], [80, 0])
  const circleY1 = useTransform(scrollYProgress, [0.7, 1], [-80, 0])
  const circleY2 = useTransform(scrollYProgress, [0.7, 1], [80, 0])

  const circleYs = [circleY0, circleY1, circleY2]

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-charcoal-obsidian">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-metallic-gold/5 via-charcoal-obsidian to-charcoal-obsidian" />

        <div className="container-main relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Text Content */}
          <div className="w-full md:w-1/2 relative h-[300px] flex items-center">
            {[
              { step: steps[0], opacity: step0Opacity, y: step0Y },
              { step: steps[1], opacity: step1Opacity, y: step1Y },
              { step: steps[2], opacity: step2Opacity, y: step2Y },
            ].map(({ step, opacity, y }, index) => (
              <motion.div
                key={index}
                style={{ opacity, y, pointerEvents: 'none' }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <span className="text-metallic-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                  Paso 0{index + 1}
                </span>
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                  {step.title}
                </h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Visual Content */}
          <div className="w-full md:w-1/2 flex justify-center items-center h-[400px]">
            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
              {/* Step 1 Visual: Flat line turning into circle */}
              <motion.div
                style={{ opacity: step1Opacity, scale: step1Scale }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div 
                  className="w-full h-1 bg-gradient-to-r from-transparent via-metallic-gold to-transparent blur-[1px]"
                  style={{ scaleX: step1ScaleX }}
                />
              </motion.div>

              {/* Step 2 Visual: Circle / Sphere Outline */}
              <motion.div
                style={{ opacity: visStep2Opacity, scale: visStep2Scale }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[200px] h-[200px] rounded-full border-[2px] border-metallic-gold/80 shadow-[0_0_60px_rgba(212,175,55,0.3)]" />
              </motion.div>

              {/* Step 3 Visual: Multiple linked circles */}
              <motion.div
                style={{ opacity: visStep3Opacity }}
                className="absolute inset-0 flex items-center justify-center gap-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{ y: circleYs[i] }}
                    className="w-16 h-16 rounded-full bg-metallic-gold/20 border border-metallic-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
