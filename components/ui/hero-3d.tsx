'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, MeshReflectorMaterial, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

function JewelModel() {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (pointer.y * 0.3 - groupRef.current.rotation.x) * 0.05
      groupRef.current.rotation.y += (pointer.x * 0.3 - groupRef.current.rotation.y) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <group position={[0, 0.5, 0]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[1.2, 0.06, 24, 80]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.95}
              roughness={0.15}
              envMapIntensity={2}
            />
          </mesh>

          <mesh position={[0, 0.15, 1.1]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.9}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>

          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const x = Math.cos(angle) * 1.2
            const z = Math.sin(angle) * 1.2
            return (
              <mesh key={i} position={[x, 0, z]} castShadow>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                  color="#d4af37"
                  metalness={0.9}
                  roughness={0.15}
                  emissive="#d4af37"
                  emissiveIntensity={0.1}
                />
              </mesh>
            )
          })}
        </group>
      </Float>
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={30}
        roughness={0.2}
        metalness={0.8}
        mirror={0.5}
        color="#1a1a1a"
      />
    </mesh>
  )
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1, 3.5], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={45} />
        <ambientLight intensity={0.3} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#d4af37" />
        <Environment preset="city" />
        <JewelModel />
        <Ground />
        <Sparkles
          count={40}
          scale={4}
          size={2}
          speed={0.3}
          color="#d4af37"
          opacity={0.6}
        />
      </Canvas>
    </div>
  )
}
