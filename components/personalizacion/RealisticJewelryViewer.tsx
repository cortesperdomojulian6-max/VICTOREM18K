'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Float, ContactShadows,
  Sparkles, Environment,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface BeadConfig {
  size: number
  scale: number
}

const BEAD_SIZES: Record<string, BeadConfig> = {
  small: { size: 0.07, scale: 1 },
  medium: { size: 0.10, scale: 1.2 },
  large: { size: 0.14, scale: 1.5 },
}

interface RealisticJewelryViewerProps {
  type: 'pulsera' | 'anillo' | null
  dije: string | null
  color: string | null
  balines: Array<{ type: 'liso' | 'diamantado', size: 'small' | 'medium' | 'large' }>
  productName?: string
}

function Bead({
  type,
  size,
  position
}: {
  type: 'liso' | 'diamantado',
  size: 'small' | 'medium' | 'large',
  position: [number, number, number]
}) {
  const config = BEAD_SIZES[size] || BEAD_SIZES.medium

  return (
    <group position={position}>
      <mesh castShadow>
        {type === 'diamantado' ? (
          // High-end faceted geometry for diamond cut
          <icosahedronGeometry args={[config.size, 1]} />
        ) : (
          <sphereGeometry args={[config.size, 32, 32]} />
        )}
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={type === 'diamantado' ? 0.15 : 0.05}
          envMapIntensity={2.5}
          emissive="#d4af37"
          emissiveIntensity={type === 'diamantado' ? 0.1 : 0}
        />
      </mesh>

      {type === 'diamantado' && (
        <mesh scale={[1.02, 1.02, 1.02]}>
          <icosahedronGeometry args={[config.size, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            metalness={1}
            roughness={0}
          />
        </mesh>
      )}
    </group>
  )
}

function JewelrySequence({ balines, dije }: { balines: any[], dije: string | null }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  const beads = useMemo(() => {
    return balines.map((b, i) => {
      // Arrange in an elegant arc (crescent shape)
      const count = balines.length || 1
      const angle = (i / (count - 1 || 1)) * Math.PI * 0.6 - Math.PI * 0.3
      const radius = 1.8

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      return (
        <Bead
          key={i}
          type={b.type || 'liso'}
          size={b.size || 'medium'}
          position={[x, 0, z]}
        />
      )
    })
  }, [balines])

  return (
    <group ref={groupRef}>
      {beads}

      {dije && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={1}
              roughness={0.1}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      )}
    </group>
  )
}

function JewelryScene(props: RealisticJewelryViewerProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={35} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={7}
        enableDamping
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.3} />
      <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={5} castShadow />
      <spotLight position={[-5, 5, -5]} angle={0.5} penumbra={1} intensity={2} color="#d4af37" />
      <pointLight position={[0, -1, 2]} intensity={0.8} color="#ffffff" />

      <Environment preset="studio" />

      <JewelrySequence
        balines={props.balines || []}
        dije={props.dije}
      />

      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.4}
        scale={12}
        blur={2}
        far={1}
      />

      <Sparkles
        count={30}
        scale={5}
        size={1}
        speed={0.2}
        color="#d4af37"
        opacity={0.3}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={0.6} />
      </EffectComposer>
    </>
  )
}

export default function RealisticJewelryViewer(props: RealisticJewelryViewerProps) {
  return (
    <div className="w-full min-h-[450px] relative overflow-hidden bg-gradient-to-b from-ebony via-charcoal to-ebony border border-gold-400/20 shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <JewelryScene {...props} />
      </Canvas>
      <div className="absolute bottom-4 right-4 text-[10px] text-gold-200/40 font-light tracking-widest uppercase select-none">
        Victorem Luxury Preview
      </div>
    </div>
  )
}
