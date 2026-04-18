// src/components/Contact/ContactBackground.js
'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function TorusKnot() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * 0.05
    mesh.current.rotation.y = t * 0.08
    mesh.current.rotation.z = t * 0.03
  })

  return (
    <mesh ref={mesh} position={[2.8, -0.2, 0]}>
      <torusKnotGeometry args={[1.6, 0.45, 120, 16, 2, 3]} />
      <meshBasicMaterial color="#f97316" wireframe opacity={0.10} transparent />
    </mesh>
  )
}

function Ring({ position, rotSpeed, radius, opacity, color }) {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * rotSpeed[0]
    mesh.current.rotation.y = t * rotSpeed[1]
    mesh.current.position.y = position[1] + Math.sin(t * 0.4 + position[0]) * 0.25
  })

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry args={[radius, 0.025, 8, 80]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  )
}

function BackgroundIcosa() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * -0.03
    mesh.current.rotation.z = t * 0.05
  })

  return (
    <mesh ref={mesh} position={[-3.5, 1, -2]}>
      <icosahedronGeometry args={[2.8, 1]} />
      <meshBasicMaterial color="#22d3ee" wireframe opacity={0.05} transparent />
    </mesh>
  )
}

export default function ContactBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 65 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        transform: 'translateZ(0)',
        isolation: 'isolate',
      }}
      dpr={[1, 1.5]}
    >
      <TorusKnot />
      <Ring position={[-3.2, 1.5, -1]} rotSpeed={[0.05, 0.08]} radius={1.6} opacity={0.09} color="#22d3ee" />
      <Ring position={[-2.0, -2.5, -1.5]} rotSpeed={[0.08, 0.04]} radius={1.0} opacity={0.08} color="#22d3ee" />
      <BackgroundIcosa />
    </Canvas>
  )
}
