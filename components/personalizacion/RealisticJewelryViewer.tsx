'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Environment,
} from '@react-three/drei'
import * as THREE from 'three'

const BEAD_SIZES = {
  small: 0.12,
  medium: 0.17,
  large: 0.22,
}

const BEAD_GAP = 0.005

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

  return (
    <mesh position={position} castShadow receiveShadow>
      {type === 'diamantado' ? (
        <icosahedronGeometry args={[r, 2]} />
      ) : (
        <sphereGeometry args={[r, 32, 32]} />
      )}
      <meshPhysicalMaterial
        color="#d4af37"
        metalness={type === 'diamantado' ? 1 : 0.9}
        roughness={type === 'diamantado' ? 0.2 : 0.08}
        envMapIntensity={type === 'diamantado' ? 3 : 2}
        clearcoat={type === 'diamantado' ? 0.2 : 0}
        clearcoatRoughness={0.15}
        emissive="#b8860b"
        emissiveIntensity={0.04}
      />
    </mesh>
  )
}

function JewelrySequence({ balines }: { balines: BeadConfig[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  const beads = useMemo(() => {
    if (!balines.length) return []

    const items = balines.map((b) => {
      const r = BEAD_SIZES[b.size] || BEAD_SIZES.medium
      return { ...b, radius: r }
    })

    const totalW = items.reduce((s, b) => s + b.radius * 2, 0) + (items.length - 1) * BEAD_GAP
    const offset = totalW / 2
    let cursor = 0

    return items.map((b, i) => {
      const x = cursor - offset + b.radius
      cursor += b.radius * 2 + BEAD_GAP
      return <Bead3D key={i} type={b.type} size={b.size} position={[x, 0, 0]} />
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

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={40} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 1.2}
        minDistance={1}
        maxDistance={5}
        enableDamping
        dampingFactor={0.1}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.35} />
      <spotLight position={[4, 6, 5]} angle={0.35} penumbra={0.8} intensity={5} castShadow />
      <spotLight position={[-3, 2, -3]} angle={0.2} penumbra={0.5} intensity={2} color="#ffd700" />
      <pointLight position={[0, -1, 3]} intensity={0.5} color="#ffffff" />

      <Environment preset="studio" />

      <JewelrySequence balines={props.balines || []} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[maxWidth * 4, maxWidth * 4]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.6} roughness={0.4} transparent opacity={0.15} />
      </mesh>
    </>
  )
}

export default function RealisticJewelryViewer(props: ViewerProps) {
  return (
    <div className="w-full min-h-[500px] md:min-h-[600px] relative overflow-hidden bg-black rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-black pointer-events-none" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)' }} />
      <Canvas shadows dpr={[1, 2]} className="absolute inset-0 w-full h-full z-10" style={{ width: '100%', height: '100%' }}>
        <JewelryScene {...props} />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-[10px] text-white/20 select-none z-20">
        Arrastra para rotar · Rueda para zoom
      </div>
    </div>
  )
}
