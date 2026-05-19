'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Float, Sparkles, MeshReflectorMaterial, PerspectiveCamera,
  Environment, Html,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function Coin({ position, rotation, speed, delay }: {
  position: [number, number, number]
  rotation: [number, number, number]
  speed: number
  delay: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const startY = position[1]
  const fallRange = 3.5
  const time = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    time.current += delta * speed
    if (ref.current) {
      const t = (time.current + delay) % (Math.PI * 2)
      ref.current.position.y = startY - (Math.sin(t) * 0.5 + 0.5) * fallRange
      ref.current.rotation.x += delta * 2
      ref.current.rotation.z += delta * 1.5
      if (ref.current.position.y < -2) {
        ref.current.position.y = startY
      }
    }
  })

  return (
    <mesh ref={ref} position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={0.95}
        roughness={0.08}
        envMapIntensity={2.5}
        emissive="#d4af37"
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}

function TioRico() {
  const groupRef = useRef<THREE.Group>(null)
  const armLRef = useRef<THREE.Group>(null)
  const armRRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (pointer.y * 0.1 - groupRef.current.rotation.x) * 0.02
      groupRef.current.rotation.y += (pointer.x * 0.1 - groupRef.current.rotation.y) * 0.02
    }

    const throwCycle = Math.sin(clock.elapsedTime * 0.8) * 0.3
    if (armLRef.current) armLRef.current.rotation.z = -0.5 + throwCycle
    if (armRRef.current) armRRef.current.rotation.z = 0.5 - throwCycle
  })

  return (
    <group ref={groupRef}>
      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.1}>
        <group position={[0, 0.8, 0]}>
          {/* Cuerpo */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.3, 0.4, 8, 12]} />
            <meshStandardMaterial color="#1a3a5c" metalness={0.3} roughness={0.6} />
          </mesh>

          {/* Chaleco dorado */}
          <mesh position={[0, -0.15, 0.15]} castShadow>
            <boxGeometry args={[0.25, 0.3, 0.05]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Cabeza */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#e8c9a0" metalness={0.1} roughness={0.6} />
          </mesh>

          {/* Nariz */}
          <mesh position={[0, 0.2, 0.18]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#d4a574" metalness={0.1} roughness={0.7} />
          </mesh>

          {/* Ojos */}
          <mesh position={[-0.06, 0.28, 0.18]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.06, 0.28, 0.18]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.06, 0.28, 0.2]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.06, 0.28, 0.2]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>

          {/* Bigote */}
          <mesh position={[-0.08, 0.18, 0.18]} rotation={[0, 0, 0.3]}>
            <capsuleGeometry args={[0.015, 0.08, 6, 6]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh position={[0.08, 0.18, 0.18]} rotation={[0, 0, -0.3]}>
            <capsuleGeometry args={[0.015, 0.08, 6, 6]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>

          {/* Sombrero de copa */}
          <group position={[0, 0.38, 0]}>
            <mesh position={[0, 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.18, 0.12, 12]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.01, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 12]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.5} />
            </mesh>
            {/* Banda dorada en el sombrero */}
            <mesh position={[0, 0.02, 0]}>
              <torusGeometry args={[0.17, 0.01, 8, 12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Brazo izquierdo (lanzando) */}
          <group ref={armLRef} position={[-0.35, -0.1, 0]}>
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
              <capsuleGeometry args={[0.04, 0.2, 6, 8]} />
              <meshStandardMaterial color="#1a3a5c" metalness={0.3} roughness={0.6} />
            </mesh>
            <mesh position={[-0.3, 0.05, 0]} castShadow>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#e8c9a0" metalness={0.1} roughness={0.6} />
            </mesh>
          </group>

          {/* Brazo derecho (lanzando) */}
          <group ref={armRRef} position={[0.35, -0.1, 0]}>
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
              <capsuleGeometry args={[0.04, 0.2, 6, 8]} />
              <meshStandardMaterial color="#1a3a5c" metalness={0.3} roughness={0.6} />
            </mesh>
            <mesh position={[0.3, 0.05, 0]} castShadow>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#e8c9a0" metalness={0.1} roughness={0.6} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  )
}

function MoneyRain() {
  const count = 40

  const coins = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 4,
        1.5 + Math.random() * 2,
        (Math.random() - 0.5) * 3 - 0.5,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ] as [number, number, number],
      speed: 0.4 + Math.random() * 0.6,
      delay: Math.random() * Math.PI * 2,
    })), [])

  return (
    <>
      {coins.map((c, i) => (
        <Coin key={i} {...c} />
      ))}
    </>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[12, 12]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
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
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.2, 4.5], fov: 38 }}>
        <PerspectiveCamera makeDefault position={[0, 1.2, 4.5]} fov={38} />
        <ambientLight intensity={0.2} />
        <spotLight position={[5, 6, 5]} angle={0.35} penumbra={0.9} intensity={3} castShadow />
        <spotLight position={[-4, 4, -4]} angle={0.25} penumbra={0.8} intensity={1.5} color="#d4af37" />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#d4af37" />
        <pointLight position={[3, -1, 3]} intensity={0.3} color="#ffeedd" />
        <Environment preset="city" />

        <TioRico />
        <MoneyRain />
        <Ground />

        <Sparkles
          count={100}
          scale={6}
          size={3.5}
          speed={0.15}
          color="#d4af37"
          opacity={0.4}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.85} height={200} intensity={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
