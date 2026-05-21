'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Environment, Float,
} from '@react-three/drei'
import * as THREE from 'three'

const BEAD_SIZES = {
  small: 0.09,
  medium: 0.13,
  large: 0.17,
}

const BEAD_GAP = 0.03

interface BeadConfig {
  type: 'liso' | 'diamantado'
  size: 'small' | 'medium' | 'large'
}

interface ViewerProps {
  type?: string | null
  dije?: string | null
  color?: string | null
  balines: BeadConfig[]
  productName?: string
}

function Bead3D({
  type,
  size,
  position,
}: {
  type: 'liso' | 'diamantado'
  size: 'small' | 'medium' | 'large'
  position: [number, number, number]
}) {
  const r = BEAD_SIZES[size] || BEAD_SIZES.medium
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current && type === 'diamantado') {
      const s = 1 + Math.sin(clock.elapsedTime * 8 + position[0]) * 0.015
      meshRef.current.scale.setScalar(s)
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.06}>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        {type === 'diamantado' ? (
          <icosahedronGeometry args={[r, 1]} />
        ) : (
          <sphereGeometry args={[r, 32, 32]} />
        )}
        <meshPhysicalMaterial
          color="#d4af37"
          metalness={type === 'diamantado' ? 0.95 : 0.85}
          roughness={type === 'diamantado' ? 0.15 : 0.08}
          envMapIntensity={type === 'diamantado' ? 2.5 : 2.0}
          clearcoat={type === 'diamantado' ? 0.1 : 0}
          clearcoatRoughness={0.2}
          emissive="#b8860b"
          emissiveIntensity={0.05}
        />
      </mesh>
    </Float>
  )
}

function JewelrySequence({ balines }: { balines: BeadConfig[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  const beads = useMemo(() => {
    if (!balines.length) return []

    const items = balines.map((b) => {
      const r = BEAD_SIZES[b.size] || BEAD_SIZES.medium
      return { ...b, diameter: r * 2 }
    })

    const totalW = items.reduce((s, b) => s + b.diameter, 0) + (items.length - 1) * BEAD_GAP
    const offset = totalW / 2
    let cursor = 0

    return items.map((b, i) => {
      const x = cursor - offset + b.diameter / 2
      cursor += b.diameter + BEAD_GAP
      return (
        <Bead3D
          key={i}
          type={b.type}
          size={b.size}
          position={[x, 0, 0]}
        />
      )
    })
  }, [balines])

  if (!balines.length) return null

  return <group ref={groupRef}>{beads}</group>
}

function JewelryScene(props: ViewerProps) {
  const count = props.balines?.length || 0
  const maxWidth = count > 0
    ? count * (BEAD_SIZES.large * 2 + BEAD_GAP)
    : 1
  const camZ = Math.max(maxWidth * 1.2 + 1, 3)

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, camZ * 0.35, camZ]} fov={38} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 1.6}
        minDistance={camZ * 0.4}
        maxDistance={camZ * 2.5}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.3} />
      <spotLight position={[5, 8, 6]} angle={0.4} penumbra={1} intensity={4} castShadow />
      <spotLight position={[-4, 3, -4]} angle={0.3} penumbra={0.8} intensity={2} color="#ffd700" />
      <pointLight position={[0, -2, 4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[3, 1, -3]} intensity={0.4} color="#ffe4b5" />

      <Environment preset="studio" />

      <JewelrySequence balines={props.balines || []} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[maxWidth * 3, maxWidth * 3]} />
        <meshStandardMaterial
          color="#0d0d0d"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  )
}

export default function RealisticJewelryViewer(props: ViewerProps) {
  return (
    <div className="w-full min-h-[400px] md:min-h-[500px] relative overflow-hidden bg-gradient-to-b from-stone-50 to-white border border-pearl rounded-xl">
      <Canvas shadows dpr={[1, 2]}>
        <JewelryScene {...props} />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-[10px] text-stone/40 select-none">
        Arrastra para rotar · Rueda para zoom
      </div>
    </div>
  )
}
