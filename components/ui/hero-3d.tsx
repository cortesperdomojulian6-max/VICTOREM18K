'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, MeshReflectorMaterial, PerspectiveCamera, Environment, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function BraidedBracelet() {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (pointer.y * 0.4 - groupRef.current.rotation.x) * 0.04
      groupRef.current.rotation.y += (pointer.x * 0.4 - groupRef.current.rotation.y) * 0.04
    }
  })

  const radius = 1.3
  const tube = 0.045
  const segments = 60
  const tubularSegments = 80

  const strands = useMemo(() => {
    return [
      { color: '#d4af37', offset: 0, scale: 1 },
      { color: '#e8c860', offset: Math.PI * 0.66, scale: 0.92 },
      { color: '#c9a82e', offset: Math.PI * 1.33, scale: 0.85 },
    ]
  }, [])

  return (
    <group ref={groupRef}>
      {strands.map((strand, i) => (
        <Float key={i} speed={0.6 + i * 0.2} rotationIntensity={0.05} floatIntensity={0.2}>
          <group>
            {Array.from({ length: tubularSegments }).map((_, j) => {
              const t = (j / tubularSegments) * Math.PI * 2
              const x = Math.cos(t) * (radius + Math.sin(t * 3 + strand.offset) * tube * 2)
              const z = Math.sin(t) * (radius + Math.sin(t * 3 + strand.offset) * tube * 2)
              const y = Math.cos(t * 3 + strand.offset) * tube * 2
              return (
                <mesh
                  key={j}
                  position={[x, y, z]}
                  rotation={[t, 0, t]}
                  castShadow
                >
                  <sphereGeometry args={[tube * strand.scale, 8, 8]} />
                  <meshStandardMaterial
                    color={strand.color}
                    metalness={0.95}
                    roughness={0.12}
                    envMapIntensity={2.5}
                    emissive={strand.color}
                    emissiveIntensity={0.08}
                  />
                </mesh>
              )
            })}
          </group>
        </Float>
      ))}

      <Float speed={0.4} rotationIntensity={0.02} floatIntensity={0.15}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <torusGeometry args={[radius, tube * 1.8, 24, 60]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.92}
            roughness={0.1}
            envMapIntensity={2.8}
            transparent
            opacity={0.15}
          />
        </mesh>
      </Float>

      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <Float key={i} speed={0.8 + i * 0.15} rotationIntensity={0.05} floatIntensity={0.2}>
            <mesh
              position={[Math.cos(angle) * radius, Math.sin(angle * 3) * 0.12, Math.sin(angle) * radius]}
              castShadow
            >
              <dodecahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial
                color="#f5e6a0"
                metalness={0.85}
                roughness={0.08}
                envMapIntensity={3}
                emissive="#d4af37"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
      <planeGeometry args={[12, 12]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
        roughness={0.1}
        metalness={0.9}
        mirror={0.7}
        color="#0d0d0d"
      />
    </mesh>
  )
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.2, 4], fov: 40 }}>
        <PerspectiveCamera makeDefault position={[0, 1.2, 4]} fov={40} />
        <ambientLight intensity={0.2} />
        <spotLight position={[4, 5, 4]} angle={0.35} penumbra={0.8} intensity={2.5} castShadow />
        <spotLight position={[-3, 3, -3]} angle={0.25} penumbra={0.7} intensity={1.2} color="#d4af37" />
        <pointLight position={[2, -1, 3]} intensity={0.3} color="#ffeedd" />
        <pointLight position={[-2, -1, -3]} intensity={0.3} color="#d4af37" />
        <Environment preset="city" />

        <BraidedBracelet />

        <Ground />

        <Sparkles
          count={50}
          scale={5}
          size={2.5}
          speed={0.2}
          color="#d4af37"
          opacity={0.5}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={200} intensity={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
