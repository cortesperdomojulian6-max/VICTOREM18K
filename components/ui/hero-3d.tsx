'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Float, Sparkles, MeshReflectorMaterial, PerspectiveCamera, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function BalinSphere({
  texture,
  position,
  scale = 1,
  speed = 0.3,
  isDiamond = false,
}: {
  texture: THREE.Texture
  position: [number, number, number]
  scale?: number
  speed?: number
  isDiamond?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * speed * 0.6
      ref.current.rotation.y += delta * speed * 0.4
      ref.current.position.y += Math.sin(Date.now() * 0.001 + offset) * delta * 0.08
    }
  })

  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[0.09 * scale, isDiamond ? 12 : 24, isDiamond ? 12 : 24]} />
      <meshStandardMaterial
        map={texture}
        metalness={0.3}
        roughness={0.35}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

function GoldenCore() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2
      ref.current.rotation.y += delta * 0.3
      ref.current.rotation.z += delta * 0.1
    }
  })

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={ref} position={[0, 0.15, 0]} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={3}
          emissive="#d4af37"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.05}
          transparent
          opacity={0.12}
          emissive="#d4af37"
          emissiveIntensity={0.05}
        />
      </mesh>
    </Float>
  )
}

function OrbitingBalines() {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  const smoothTex = useLoader(THREE.TextureLoader, '/assets/images/balines/balineslisos.jpeg')
  const diamondTex = useLoader(THREE.TextureLoader, '/assets/images/balines/balinesdiamantados.jpeg')

  useEffect(() => {
    ;[smoothTex, diamondTex].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(1, 1)
      t.needsUpdate = true
    })
  }, [smoothTex, diamondTex])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (pointer.y * 0.15 - groupRef.current.rotation.x) * 0.025
      groupRef.current.rotation.y += (pointer.x * 0.15 - groupRef.current.rotation.y) * 0.025
    }
  })

  const rings = useMemo(() => [
    { radius: 1.0, count: 8, scale: 0.7, speed: 0.4, isDiamond: false, tilt: 0 },
    { radius: 1.6, count: 12, scale: 0.9, speed: -0.3, isDiamond: true, tilt: 0.3 },
    { radius: 2.2, count: 16, scale: 1.1, speed: 0.2, isDiamond: false, tilt: -0.2 },
    { radius: 2.8, count: 10, scale: 1.3, speed: -0.15, isDiamond: true, tilt: 0.4 },
  ], [])

  const balines = useMemo(() =>
    rings.flatMap((ring) =>
      Array.from({ length: ring.count }, (_, i) => {
        const angle = (i / ring.count) * Math.PI * 2
        return {
          position: [
            Math.cos(angle) * ring.radius,
            Math.sin(angle * 3) * 0.1,
            Math.sin(angle) * ring.radius,
          ] as [number, number, number],
          scale: ring.scale,
          speed: ring.speed,
          isDiamond: ring.isDiamond,
          texture: ring.isDiamond ? diamondTex : smoothTex,
          angle,
          ringRadius: ring.radius,
          tilt: ring.tilt,
        }
      })
    ), [rings, smoothTex, diamondTex])

  return (
    <group ref={groupRef}>
      {balines.map((b, i) => (
        <Float key={i} speed={0.3 + (i % 3) * 0.15} rotationIntensity={0.02} floatIntensity={0.08}>
          <BalinSphere
            texture={b.texture}
            position={b.position}
            scale={b.scale}
            speed={b.speed}
            isDiamond={b.isDiamond}
          />
        </Float>
      ))}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[14, 14]} />
      <MeshReflectorMaterial
        blur={[500, 100]}
        resolution={512}
        mixBlur={1.2}
        mixStrength={50}
        roughness={0.05}
        metalness={0.95}
        mirror={0.8}
        color="#050505"
      />
    </mesh>
  )
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.5, 4.5], fov: 40 }}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={40} />
        <ambientLight intensity={0.15} />
        <spotLight position={[5, 6, 5]} angle={0.3} penumbra={0.9} intensity={3} castShadow />
        <spotLight position={[-4, 4, -4]} angle={0.25} penumbra={0.8} intensity={1.5} color="#d4af37" />
        <pointLight position={[3, -1, 3]} intensity={0.4} color="#ffeedd" />
        <pointLight position={[-3, -1, -3]} intensity={0.3} color="#d4af37" />
        <Environment preset="city" />

        <GoldenCore />
        <OrbitingBalines />
        <Ground />

        <Sparkles
          count={80}
          scale={6}
          size={3}
          speed={0.15}
          color="#d4af37"
          opacity={0.35}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.85} height={200} intensity={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
