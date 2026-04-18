// src/components/About/GeometryBackground.js
'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function Icosahedron() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * 0.07
    mesh.current.rotation.y = t * 0.11
    mesh.current.rotation.z = t * 0.04
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2.8, 1]} />
      <meshBasicMaterial color="#22d3ee" wireframe opacity={0.18} transparent />
    </mesh>
  )
}

function OuterRing() {
  const mesh = useRef()

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * -0.04
    mesh.current.rotation.z = t * 0.07
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[4.2, 1]} />
      <meshBasicMaterial color="#f97316" wireframe opacity={0.05} transparent />
    </mesh>
  )
}

export default function GeometryBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        transform: 'translateZ(0)',   /* own compositor layer — avoids will-change conflicts */
        isolation: 'isolate',
      }}
      dpr={[1, 1.5]}
    >
      <Icosahedron />
      <OuterRing />
    </Canvas>
  )
}
