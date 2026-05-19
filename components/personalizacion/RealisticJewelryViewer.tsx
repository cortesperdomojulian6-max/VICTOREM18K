'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Float, ContactShadows,
  Sparkles, Environment,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface RealisticJewelryViewerProps {
  type: 'pulsera' | 'anillo' | null
  dije: string | null
  color: string | null
  balines: number
  textureUrl?: string | null
  productName?: string
  balinType?: 'lisos' | 'diamantados'
}

const BEAD_SIZES = {
  small: { size: 0.08, texSuffix: 1 },
  medium: { size: 0.10, texSuffix: 2 },
  large: { size: 0.13, texSuffix: 4 },
}

function BeadTextureLoader({ type }: { type: 'lisos' | 'diamantados' }) {
  const prefix = type === 'lisos' ? 'liso' : 'diamantado'
  const tex1 = useLoader(THREE.TextureLoader, `/assets/images/balines/individual/${prefix}-1.png`)
  const tex2 = useLoader(THREE.TextureLoader, `/assets/images/balines/individual/${prefix}-2.png`)
  const tex4 = useLoader(THREE.TextureLoader, `/assets/images/balines/individual/${prefix}-4.png`)
  const tex7 = useLoader(THREE.TextureLoader, `/assets/images/balines/individual/${prefix}-7.png`)
  const tex10 = useLoader(THREE.TextureLoader, `/assets/images/balines/individual/${prefix}-10.png`)
  return { tex1, tex2, tex4, tex7, tex10 }
}

function RealBracelet({
  balineCount,
  dijeName,
  balinType,
}: {
  balineCount: number
  dijeName: string | null
  balinType: 'lisos' | 'diamantados'
}) {
  const groupRef = useRef<THREE.Group>(null)
  const radius = 1.6

  const textures = BeadTextureLoader({ type: balinType })

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.2
  })

  const beadData = useMemo(() => {
    const faces = Math.max(balineCount, 4)
    const beads: { angle: number; pos: [number, number, number]; size: number; tex: THREE.Texture }[] = []

    for (let i = 0; i < faces; i++) {
      const t = (i / faces) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(t) * radius
      const z = Math.sin(t) * radius

      const progress = Math.abs(i / faces - 0.5) * 2
      let size: number
      let tex: THREE.Texture

      if (progress < 0.3) {
        size = BEAD_SIZES.large.size
        tex = textures.tex7
      } else if (progress < 0.6) {
        size = BEAD_SIZES.medium.size
        tex = textures.tex4
      } else {
        size = BEAD_SIZES.small.size
        tex = textures.tex1
      }

      beads.push({
        angle: t,
        pos: [x, 0, z],
        size,
        tex,
      })
    }
    return beads
  }, [balineCount, textures])

  const wireRadius = 0.015

  return (
    <group ref={groupRef}>
      {beadData.map((bead, i) => (
        <group key={i}>
          <mesh position={bead.pos} castShadow>
            <sphereGeometry args={[bead.size, 20, balinType === 'diamantados' ? 14 : 20]} />
            <meshStandardMaterial
              map={bead.tex}
              metalness={0.3}
              roughness={0.3}
              envMapIntensity={1.2}
            />
          </mesh>

          {bead.size > 0.09 && (
            <mesh position={bead.pos} castShadow>
              <sphereGeometry args={[bead.size * 1.02, 12, 12]} />
              <meshStandardMaterial
                color="#d4af37"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.1}
                envMapIntensity={2}
              />
            </mesh>
          )}
        </group>
      ))}

      {Array.from({ length: 30 }).map((_, i) => {
        const t = (i / 30) * Math.PI * 2
        const x = Math.cos(t) * radius
        const z = Math.sin(t) * radius
        return (
          <mesh key={`wire-${i}`} position={[x, 0, z]} rotation={[t + Math.PI / 2, 0, 0]}>
            <torusGeometry args={[wireRadius, wireRadius * 0.6, 6, 8]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.95}
              roughness={0.1}
              envMapIntensity={2.5}
            />
          </mesh>
        )
      })}

      {dijeName && (
        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.15}>
          <mesh position={[0, -radius - 0.15, 0]} castShadow>
            <boxGeometry args={[0.12, 0.15, 0.04]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.92}
              roughness={0.12}
              envMapIntensity={2.5}
            />
          </mesh>
          <mesh position={[0, -radius - 0.28, 0]} castShadow>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.95}
              roughness={0.05}
              emissive="#d4af37"
              emissiveIntensity={0.15}
              envMapIntensity={3}
            />
          </mesh>
        </Float>
      )}
    </group>
  )
}

function RealRing({
  balineCount,
  balinType,
}: {
  balineCount: number
  balinType: 'lisos' | 'diamantados'
}) {
  const groupRef = useRef<THREE.Group>(null)

  const textures = BeadTextureLoader({ type: balinType })

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  const bandRadius = 0.75
  const bandThickness = 0.07
  const stoneSize = 0.14

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[bandRadius, bandThickness, 20, 48]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.92}
          roughness={0.1}
          envMapIntensity={2.5}
        />
      </mesh>

      <mesh position={[0, 0.15, 0]} castShadow>
        <octahedronGeometry args={[stoneSize, 0]} />
        <meshStandardMaterial
          color={balinType === 'diamantados' ? '#ffffff' : '#d4af37'}
          metalness={balinType === 'diamantados' ? 0.2 : 0.9}
          roughness={balinType === 'diamantados' ? 0.02 : 0.1}
          envMapIntensity={3}
          emissive={balinType === 'diamantados' ? '#88ccff' : undefined}
          emissiveIntensity={balinType === 'diamantados' ? 0.15 : 0}
        />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (bandRadius + 0.02), 0.06, Math.sin(a) * (bandRadius + 0.02)]}
            rotation={[0, 0, -a]}
            castShadow
          >
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} envMapIntensity={2} />
          </mesh>
        )
      })}

      {Array.from({ length: Math.min(balineCount, 6) }).map((_, i) => {
        const a = (i / Math.min(balineCount, 6)) * Math.PI * 2 + Math.PI / 6
        return (
          <mesh
            key={`balin-${i}`}
            position={[Math.cos(a) * (bandRadius + 0.05), -0.02, Math.sin(a) * (bandRadius + 0.05)]}
            castShadow
          >
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial
              map={textures.tex1}
              metalness={0.3}
              roughness={0.3}
              envMapIntensity={1.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function JewelryScene(props: RealisticJewelryViewerProps) {
  const isBracelet = props.type === 'pulsera'
  const isRing = props.type === 'anillo'
  const bt = props.balinType || 'lisos'

  if (!props.type) {
    return (
      <>
        <PerspectiveCamera makeDefault position={[0, 1, 4.5]} fov={45} />
        <ambientLight intensity={0.3} />
        <spotLight position={[5, 5, 5]} angle={0.4} penumbra={1} intensity={2} castShadow />
        <Environment preset="city" />
        <group rotation={[0.2, 0, 0]}>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.08, 24, 60]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} envMapIntensity={2} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0]} castShadow>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
              </mesh>
            )
          })}
        </group>
        <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={4} blur={2.5} far={1.5} />
      </>
    )
  }

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, isBracelet ? 1.2 : 0.5, isBracelet ? 4.5 : 2.8]}
        fov={isBracelet ? 38 : 32}
      />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={isBracelet ? 2.5 : 1.5}
        maxDistance={isBracelet ? 8 : 5}
        enableDamping
        dampingFactor={0.1}
      />
      <ambientLight intensity={0.25} />
      <spotLight position={[5, 6, 5]} angle={0.35} penumbra={0.8} intensity={3.5} castShadow />
      <spotLight position={[-4, 3, -4]} angle={0.25} penumbra={0.7} intensity={1.5} color="#d4af37" />
      <pointLight position={[0, -2, 4]} intensity={0.4} color="#ffffff" />
      <pointLight position={[3, 1, -3]} intensity={0.5} color="#ffeedd" />
      <Environment preset="studio" />

      <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.1}>
        {isBracelet && (
          <RealBracelet
            balineCount={props.balines}
            dijeName={props.dije}
            balinType={bt}
          />
        )}
        {isRing && (
          <RealRing
            balineCount={props.balines}
            balinType={bt}
          />
        )}
      </Float>

      <ContactShadows
        position={[0, isBracelet ? -1.3 : -0.7, 0]}
        opacity={0.35}
        scale={isBracelet ? 5 : 3}
        blur={2.5}
        far={1.5}
      />
      <Sparkles
        count={12}
        scale={isBracelet ? 3 : 1.5}
        size={1.5}
        speed={0.12}
        color="#d4af37"
        opacity={0.25}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.8} height={200} intensity={0.35} />
      </EffectComposer>
    </>
  )
}

export default function RealisticJewelryViewer(props: RealisticJewelryViewerProps) {
  return (
    <div className="w-full min-h-[420px] relative overflow-hidden bg-gradient-to-b from-stone-100 to-white border border-pearl">
      <Canvas shadows dpr={[1, 2]}>
        <JewelryScene {...props} />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-[10px] text-stone/50 select-none">
        Arrastra para rotar · Rueda para zoom
      </div>
    </div>
  )
}
