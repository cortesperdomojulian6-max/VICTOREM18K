'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Float, ContactShadows,
  Sparkles, Html, Environment
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { RotateCcw, Maximize2 } from 'lucide-react'

interface JewelryViewerProps {
  type: 'pulsera' | 'anillo' | null
  dije: string | null
  color: string | null
  balines: number
}

const COLOR_MAP: Record<string, string> = {
  gold: '#d4af37', silver: '#c0c0c0', rose: '#e8a0b4', black: '#1a1a1a',
}

function Charm({ name, color }: { name: string | null; color: string }) {
  if (!name) return null

  const shape = useMemo(() => {
    const s = new THREE.Shape()
    switch (name) {
      case 'estrella':
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2
          s.lineTo(Math.cos(a) * (i % 2 === 0 ? 0.22 : 0.1), Math.sin(a) * (i % 2 === 0 ? 0.22 : 0.1))
        }
        s.closePath()
        return s
      case 'corazon':
        s.moveTo(0, 0.15); s.bezierCurveTo(-0.25, 0.3, -0.25, 0, 0, -0.1)
        s.bezierCurveTo(0.25, 0, 0.25, 0.3, 0, 0.15)
        return s
      case 'media-luna':
        s.absarc(0, 0, 0.2, -0.5, 0.5, false)
        s.absarc(0.08, 0.05, 0.15, 0.8, -0.8, true)
        return s
      case 'cruz': {
        const w = 0.04, h = 0.2, bw = 0.12, bh = 0.06
        s.moveTo(-bw / 2, -h / 2); s.lineTo(bw / 2, -h / 2); s.lineTo(bw / 2, -bh / 2)
        s.lineTo(w / 2, -bh / 2); s.lineTo(w / 2, bh / 2); s.lineTo(bw / 2, bh / 2)
        s.lineTo(bw / 2, h / 2); s.lineTo(-bw / 2, h / 2); s.lineTo(-bw / 2, bh / 2)
        s.lineTo(-w / 2, bh / 2); s.lineTo(-w / 2, -bh / 2); s.lineTo(-bw / 2, -bh / 2)
        s.closePath()
        return s
      }
      case 'mariposa':
        s.moveTo(0, 0); s.bezierCurveTo(-0.25, 0.15, -0.3, -0.1, -0.1, -0.15)
        s.lineTo(0, -0.05); s.lineTo(0.1, -0.15); s.bezierCurveTo(0.3, -0.1, 0.25, 0.15, 0, 0)
        return s
      case 'hoja':
        s.moveTo(0, -0.15); s.quadraticCurveTo(0.2, 0, 0, 0.15)
        s.quadraticCurveTo(-0.2, 0, 0, -0.15)
        return s
      case 'infinito':
        s.moveTo(-0.15, 0); s.bezierCurveTo(-0.15, 0.15, 0.15, -0.15, 0.15, 0)
        s.bezierCurveTo(0.15, 0.15, -0.15, -0.15, -0.15, 0)
        return s
      case 'aru':
        s.moveTo(-0.08, -0.08); s.lineTo(0.08, 0.08)
        s.lineTo(0.08, -0.08); s.lineTo(-0.08, 0.08); s.closePath()
        return s
      default:
        return s
    }
  }, [name])

  return (
    <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
      <extrudeGeometry args={[shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 4 }]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} envMapIntensity={1.5} />
    </mesh>
  )
}

function Baline({ position, color, index }: { position: [number, number, number]; color: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.setScalar(hovered ? 1.4 : 1)
    }
  })

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[0.055, 20, 20]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.15}
        emissive={hovered ? color : undefined}
        emissiveIntensity={hovered ? 0.3 : 0}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

function Ring({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.06, 24, 80]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.15}
        envMapIntensity={2}
      />
    </mesh>
  )
}

function JewelryModel({ type, dije, color, balines }: JewelryViewerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const isBracelet = type === 'pulsera'
  const radius = isBracelet ? 1.5 : 0.6
  const c = color || '#d4af37'

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  if (!type) {
    return (
      <group>
        <Ring radius={1.5} color="#d4af37" />
        <Ring radius={1.42} color={c} />
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <Ring radius={radius} color={c} />

      {Array.from({ length: balines }).map((_, i) => {
        const angle = (i / balines) * Math.PI * 2
        return (
          <Baline
            key={i}
            position={[Math.cos(angle) * radius, 0.06, Math.sin(angle) * radius]}
            color={c}
            index={i}
          />
        )
      })}

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Charm name={dije} color={c} />
      </Float>
    </group>
  )
}

export default function JewelryViewer(props: JewelryViewerProps) {
  const controlsRef = useRef(null)

  const resetCamera = () => {
    if (controlsRef.current) {
      const c = controlsRef.current as any
      c.reset()
    }
  }

  return (
    <div className="w-full min-h-[420px] relative overflow-hidden bg-gradient-to-b from-stone-100 to-white border border-pearl group">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, props.type === 'anillo' ? 2.5 : 4.5], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 2, props.type === 'anillo' ? 2.5 : 4.5]} fov={45} />
        <OrbitControls
          ref={controlsRef as any}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={props.type === 'anillo' ? 1.5 : 2.5}
          maxDistance={props.type === 'anillo' ? 4 : 7}
          enableDamping
          dampingFactor={0.1}
        />

        <ambientLight intensity={0.4} />
        <spotLight position={[5, 5, 5]} angle={0.4} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-3, 2, -3]} intensity={0.8} color="#d4af37" />
        <pointLight position={[3, -1, 3]} intensity={0.3} color="#ffffff" />

        <Environment preset="city" />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
          <JewelryModel {...props} />
        </Float>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={5}
          blur={2.5}
          far={2}
        />

        <Sparkles
          count={20}
          scale={3}
          size={1.5}
          speed={0.2}
          color="#d4af37"
          opacity={0.4}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.85} height={200} intensity={0.6} />
        </EffectComposer>
      </Canvas>

      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={resetCamera}
          className="size-8 bg-white/80 backdrop-blur-sm border border-pearl flex items-center justify-center hover:bg-gold-400 hover:text-white transition-colors"
          aria-label="Resetear cámara"
        >
          <RotateCcw className="size-3.5" />
        </button>
        <button
          onClick={() => {
            const el = document.querySelector('.personalizacion-3d-container')?.closest('[data-fullscreen]')
            if (document.fullscreenElement) {
              document.exitFullscreen()
            } else {
              const container = document.querySelector('.personalizacion-3d-container')
              if (container) container.requestFullscreen()
            }
          }}
          className="size-8 bg-white/80 backdrop-blur-sm border border-pearl flex items-center justify-center hover:bg-gold-400 hover:text-white transition-colors"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 text-[10px] text-stone/50 select-none">
        Arrastra para rotar · Rueda para zoom
      </div>
    </div>
  )
}
