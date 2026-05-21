'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Environment,
} from '@react-three/drei'
import * as THREE from 'three'

const BEAD_SIZES = {
  small: 0.08,
  medium: 0.11,
  large: 0.15,
}

const BEAD_GAP = 0.02

interface BeadConfig {
  type: 'liso' | 'diamantado'
  size: 'small' | 'medium' | 'large'
}

interface RealisticJewelryViewerProps {
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
  textureIndex,
}: {
  type: 'liso' | 'diamantado'
  size: 'small' | 'medium' | 'large'
  position: [number, number, number]
  textureIndex: number
}) {
  const r = BEAD_SIZES[size] || BEAD_SIZES.medium
  const prefix = type === 'liso' ? 'liso' : 'diamantado'
  const texNum = (textureIndex % 13) + 1

  const texture = useLoader(
    THREE.TextureLoader,
    `/assets/images/balines/individual/${prefix}/${prefix}-${texNum}.png`
  )

  texture.needsUpdate = true

  return (
    <mesh position={position} castShadow>
      {type === 'diamantado' ? (
        <icosahedronGeometry args={[r, 1]} />
      ) : (
        <sphereGeometry args={[r, 24, 24]} />
      )}
      <meshStandardMaterial
        map={texture}
        metalness={0.4}
        roughness={0.3}
        envMapIntensity={1.0}
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

  const { beads, totalWidth } = useMemo(() => {
    if (!balines.length) return { beads: [], totalWidth: 0 }

    let totalW = 0
    const items = balines.map((b) => {
      const r = BEAD_SIZES[b.size] || BEAD_SIZES.medium
      const diameter = r * 2
      totalW += diameter
      return { ...b, diameter }
    })
    totalW += (items.length - 1) * BEAD_GAP

    const offset = totalW / 2
    let cursor = 0
    const result = items.map((b, i) => {
      const x = cursor - offset + b.diameter / 2
      cursor += b.diameter + BEAD_GAP
      return (
        <Bead3D
          key={i}
          type={b.type}
          size={b.size}
          position={[x, 0, 0]}
          textureIndex={i}
        />
      )
    })

    return { beads: result, totalWidth: totalW }
  }, [balines])

  if (!balines.length) {
    return (
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.3} />
      </mesh>
    )
  }

  return (
    <group ref={groupRef}>
      {beads}
    </group>
  )
}

function JewelryScene(props: RealisticJewelryViewerProps) {
  const count = props.balines?.length || 0
  const maxWidth = count > 0
    ? count * (BEAD_SIZES.large * 2 + BEAD_GAP)
    : 1
  const camDistance = Math.max(maxWidth * 0.8, 1.5)

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, camDistance * 0.4, camDistance]}
        fov={40}
      />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={camDistance * 0.5}
        maxDistance={camDistance * 2.5}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.5} />
      <spotLight position={[5, 8, 6]} angle={0.4} penumbra={1} intensity={3} castShadow />
      <spotLight position={[-4, 3, -4]} angle={0.3} penumbra={0.8} intensity={1.5} color="#d4af37" />
      <pointLight position={[0, -2, 3]} intensity={0.6} color="#ffffff" />

      <Environment preset="studio" />

      <JewelrySequence balines={props.balines || []} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[maxWidth * 2, maxWidth * 2]} />
        <shadowMaterial transparent opacity={0.25} />
      </mesh>
    </>
  )
}

export default function RealisticJewelryViewer(props: RealisticJewelryViewerProps) {
  return (
    <div className="w-full aspect-[4/3] md:aspect-[16/9] relative overflow-hidden bg-gradient-to-b from-stone-100 to-white border border-pearl rounded-xl">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.5, 2.5], fov: 40 }}>
        <JewelryScene {...props} />
      </Canvas>
      <div className="absolute bottom-2 left-3 text-[10px] text-stone/40 select-none">
        Arrastra para rotar · Rueda para zoom
      </div>
    </div>
  )
}
