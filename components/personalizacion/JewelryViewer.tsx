'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, Stage } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface JewelryViewerProps {
  type: 'pulsera' | 'anillo' | null
  dije: string | null
  color: string | null
  balines: number
}

const Charm = ({ name, color }: { name: string | null; color: string }) => {
  if (!name) return null

  const shape = useMemo(() => {
    switch (name) {
      case 'estrella':
        const star = new THREE.Shape()
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2
          const r = i % 2 === 0 ? 0.2 : 0.1
          star.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
        }
        star.closePath()
        return star
      case 'corazon':
        const heart = new THREE.Shape()
        heart.moveTo(0, 0)
        heart.bezierCurveTo(-0.2, 0, -0.3, 0.2, 0, 0.3)
        heart.bezierCurveTo(0.3, 0.2, 0.2, 0, 0, 0)
        return heart
      case 'media-luna':
        const moon = new THREE.Shape()
        moon.absarc(0, 0, 0.2, 0, Math.PI * 2, false)
        // Approximating a crescent by shifting a second circle
        return moon
      case 'cruz':
        const cross = new THREE.Shape()
        cross.moveTo(-0.05, -0.2)
        cross.lineTo(0.05, -0.2)
        cross.lineTo(0.05, -0.05)
        cross.lineTo(0.15, -0.05)
        cross.lineTo(0.15, 0.05)
        cross.lineTo(0.05, 0.05)
        cross.lineTo(0.05, 0.15)
        cross.lineTo(-0.05, 0.15)
        cross.lineTo(-0.05, 0.05)
        cross.lineTo(-0.15, 0.05)
        cross.lineTo(-0.15, -0.05)
        cross.lineTo(-0.05, -0.05)
        cross.lineTo(-0.05, -0.2)
        return cross
      case 'mariposa':
        const butterfly = new THREE.Shape()
        butterfly.moveTo(0,0)
        butterfly.bezierCurveTo(-0.2, 0.2, -0.3, 0, -0.1, -0.1)
        butterfly.lineTo(0,0)
        butterfly.bezierCurveTo(0.2, 0.2, 0.3, 0, 0.1, -0.1)
        return butterfly
      case 'hoja':
        const leaf = new THREE.Shape()
        leaf.moveTo(0, 0)
        leaf.quadraticCurveTo(0.2, 0.1, 0, 0.3)
        leaf.quadraticCurveTo(-0.2, 0.1, 0, 0)
        return leaf
      case 'infinito':
        const infinity = new THREE.Shape()
        infinity.moveTo(-0.2, 0)
        infinity.bezierCurveTo(-0.2, 0.2, 0.2, -0.2, 0.2, 0)
        infinity.bezierCurveTo(0.2, 0.2, -0.2, -0.2, -0.2, 0)
        return infinity
      case 'aru':
        const aru = new THREE.Shape()
        aru.moveTo(-0.1, -0.1)
        aru.lineTo(0.1, 0.1)
        aru.lineTo(0.1, -0.1)
        aru.lineTo(-0.1, 0.1)
        return aru
      default:
        return new THREE.Shape()
    }
  }, [name])

  return (
    <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
      <extrudeGeometry args={[shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

const JewelryModel = ({ type, dije, color, balines }: JewelryViewerProps) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  const isBracelet = type === 'pulsera'
  const radius = isBracelet ? 1.5 : 0.6
  const tube = isBracelet ? 0.06 : 0.04

  return (
    <group ref={groupRef}>
      {/* Main Ring / Bracelet */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius, tube, 16, 100]} />
        <meshStandardMaterial color={color || '#d4af37'} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Balines (Spheres) */}
      {Array.from({ length: balines }).map((_, i) => {
        const angle = (i / balines) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <mesh key={i} position={[x, 0, z]} castShadow>
            <sphereGeometry args={[tube * 0.8, 16, 16]} />
            <meshStandardMaterial color={color || '#d4af37'} metalness={0.8} roughness={0.2} />
          </mesh>
        )
      })}

      {/* Charm */}
      <Charm name={dije} color={color || '#d4af37'} />
    </group>
  )
}

export default function JewelryViewer({ type, dije, color, balines }: JewelryViewerProps) {
  return (
    <div className="w-full min-h-[400px] relative rounded-xl overflow-hidden bg-gradient-to-b from-stone-100 to-white border border-pearl">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
        />

        <Stage environment="city" intensity={0.5} shadows>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <JewelryModel type={type} dije={dije} color={color} balines={balines} />
          </Float>
        </Stage>

        <EffectComposer>
          <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
