'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  OrbitControls, PerspectiveCamera, Float, ContactShadows,
  Sparkles, Environment, Html
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

const COLOR_MAP: Record<string, string> = {
  gold: '#d4af37', silver: '#c0c0c0', rose: '#e8a0b4', black: '#1a1a1a',
}

function TextureBracelet({
  textureUrl,
  color,
  balineCount,
  dijeName,
  balinType = 'lisos',
}: {
  textureUrl?: string | null
  color: string
  balineCount: number
  dijeName: string | null
  balinType?: 'lisos' | 'diamantados'
}) {
  const groupRef = useRef<THREE.Group>(null)
  const radius = 1.5
  const tube = 0.1

  const productTex = useLoader(THREE.TextureLoader, textureUrl || '', (loader) => {
    loader.crossOrigin = 'anonymous'
  })

  const balinTex = useLoader(
    THREE.TextureLoader,
    balinType === 'diamantados'
      ? '/assets/images/balines/balinesdiamantados.jpeg'
      : '/assets/images/balines/balineslisos.jpeg',
  )

  useEffect(() => {
    if (productTex) {
      productTex.wrapS = THREE.RepeatWrapping
      productTex.wrapT = THREE.RepeatWrapping
      productTex.repeat.set(2, 1)
      productTex.needsUpdate = true
    }
  }, [productTex])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.25
  })

  const balinePositions = useMemo(() =>
    Array.from({ length: balineCount }, (_, i) => {
      const angle = (i / balineCount) * Math.PI * 2
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      ] as [number, number, number]
    }), [balineCount])

  const hasValidTexture = textureUrl && textureUrl.length > 0

  return (
    <group ref={groupRef}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[radius, tube, 40, 80]} />
          {hasValidTexture ? (
            <meshStandardMaterial
              map={productTex}
              metalness={0.3}
              roughness={0.4}
              envMapIntensity={1.2}
            />
          ) : (
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.15}
              envMapIntensity={2.5}
            />
          )}
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <torusGeometry args={[radius - 0.02, tube * 0.3, 20, 60]} />
          <meshStandardMaterial
            color={color}
            metalness={0.95}
            roughness={0.1}
            envMapIntensity={3}
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {balinePositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.09, balinType === 'diamantados' ? 12 : 20, balinType === 'diamantados' ? 12 : 20]} />
          <meshStandardMaterial
            map={balinTex}
            metalness={0.3}
            roughness={0.3}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}

      {dijeName && (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh position={[-radius - 0.25, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 0.18, 0.05]} />
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.15}
              envMapIntensity={2.5}
            />
          </mesh>
          <mesh position={[-radius - 0.25, -0.22, 0]} castShadow>
            <dodecahedronGeometry args={[0.06, 0]} />
            <meshStandardMaterial
              color={color}
              metalness={0.95}
              roughness={0.08}
              emissive={color}
              emissiveIntensity={0.15}
              envMapIntensity={3}
            />
          </mesh>
        </Float>
      )}
    </group>
  )
}

function TextureRing({
  textureUrl,
  color,
  isDiamond,
  isTriple,
  balinType = 'lisos',
}: {
  textureUrl?: string | null
  color: string
  isDiamond: boolean
  isTriple: boolean
  balinType?: 'lisos' | 'diamantados'
}) {
  const groupRef = useRef<THREE.Group>(null)

  const productTex = useLoader(THREE.TextureLoader, textureUrl || '', (loader) => {
    loader.crossOrigin = 'anonymous'
  })

  const balinTex = useLoader(
    THREE.TextureLoader,
    balinType === 'diamantados'
      ? '/assets/images/balines/balinesdiamantados.jpeg'
      : '/assets/images/balines/balineslisos.jpeg',
  )

  useEffect(() => {
    if (productTex) {
      productTex.wrapS = THREE.RepeatWrapping
      productTex.wrapT = THREE.RepeatWrapping
      productTex.repeat.set(2, 1)
      productTex.needsUpdate = true
    }
  }, [productTex])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35
  })

  const hasValidTexture = textureUrl && textureUrl.length > 0

  return (
    <group ref={groupRef}>
      {isTriple ? (
        [-0.1, 0, 0.1].map((offset, i) => (
          <mesh key={i} position={[0, offset, 0]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.75, 0.05, 20, 60]} />
            <meshStandardMaterial
              color={i === 1 ? color : '#c0c0c0'}
              metalness={0.92}
              roughness={0.12}
              envMapIntensity={2}
            />
          </mesh>
        ))
      ) : (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.75, 0.08, 28, 60]} />
          {hasValidTexture ? (
            <meshStandardMaterial
              map={productTex}
              metalness={0.3}
              roughness={0.4}
              envMapIntensity={1.2}
            />
          ) : (
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.12}
              envMapIntensity={2.5}
            />
          )}
        </mesh>
      )}

      <mesh position={[0, 0.18, 0]} castShadow>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={isDiamond ? '#ffffff' : color}
          metalness={0.3}
          roughness={isDiamond ? 0.02 : 0.1}
          envMapIntensity={3}
          emissive={isDiamond ? '#88ccff' : undefined}
          emissiveIntensity={isDiamond ? 0.2 : 0}
        />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.22, 0.06, Math.sin(angle) * 0.22]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.06, 0.02]} />
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.15}
              envMapIntensity={2}
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
  const c = props.color && COLOR_MAP[props.color] ? COLOR_MAP[props.color] : '#d4af37'

  const isDiamond = props.productName?.toLowerCase().includes('diamant') ?? false
  const isTriple = props.productName?.toLowerCase().includes('tres') ?? false

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
        position={[0, isBracelet ? 1.5 : 0.6, isBracelet ? 5 : 3]}
        fov={isBracelet ? 40 : 35}
      />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={isBracelet ? 2.5 : 1.5}
        maxDistance={isBracelet ? 8 : 5}
        enableDamping
        dampingFactor={0.1}
      />
      <ambientLight intensity={0.35} />
      <spotLight position={[5, 6, 5]} angle={0.35} penumbra={0.8} intensity={3} castShadow />
      <spotLight position={[-4, 3, -4]} angle={0.3} penumbra={0.7} intensity={1.5} color="#d4af37" />
      <pointLight position={[0, -2, 4]} intensity={0.4} color="#ffffff" />
      <pointLight position={[3, 1, -3]} intensity={0.6} color="#ffeedd" />
      <Environment preset="studio" />

      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.15}>
        {isBracelet && (
          <TextureBracelet
            textureUrl={props.textureUrl}
            color={c}
            balineCount={props.balines}
            dijeName={props.dije}
            balinType={props.balinType}
          />
        )}
        {isRing && (
          <TextureRing
            textureUrl={props.textureUrl}
            color={c}
            isDiamond={isDiamond}
            isTriple={isTriple}
            balinType={props.balinType}
          />
        )}
      </Float>

      <ContactShadows
        position={[0, isBracelet ? -1.5 : -0.8, 0]}
        opacity={0.3}
        scale={isBracelet ? 5 : 3}
        blur={2.5}
        far={1.5}
      />
      <Sparkles
        count={15}
        scale={isBracelet ? 3.5 : 2}
        size={1.8}
        speed={0.15}
        color="#d4af37"
        opacity={0.3}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.8} height={200} intensity={0.4} />
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
