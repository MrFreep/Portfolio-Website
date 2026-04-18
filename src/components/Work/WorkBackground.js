// src/components/Work/WorkBackground.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A single glowing torus ring
function Ring({ z, index, total }) {
  const meshRef = useRef()

  // Alternate cyan / orange colouring across the tunnel
  const color = useMemo(() => {
    const t = index / total
    return t < 0.5 ? '#22d3ee' : '#f97316'
  }, [index, total])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    // Slow rotation on two axes — each ring at its own phase
    meshRef.current.rotation.x = t * 0.12 + index * 0.4
    meshRef.current.rotation.z = t * 0.08 + index * 0.25
    // Subtle breathing scale
    const pulse = 1 + Math.sin(t * 0.6 + index * 0.8) * 0.04
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <mesh ref={meshRef} position={[z, 0, 0]}>
      <torusGeometry args={[1.6, 0.018, 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0.22} />
    </mesh>
  )
}

// Thin horizontal grid lines that travel through the tunnel
function GridLines() {
  const linesRef = useRef()

  const geometry = useMemo(() => {
    const pts = []
    // 8 horizontal lines evenly spaced vertically
    for (let i = 0; i < 8; i++) {
      const y = -3.5 + i * 1.0
      pts.push(new THREE.Vector3(-28, y, 0))
      pts.push(new THREE.Vector3( 28, y, 0))
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!linesRef.current) return
    // Drift forward slowly
    linesRef.current.position.z = (clock.elapsedTime * 0.15) % 1.0
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.045} />
    </lineSegments>
  )
}

// Vertical tick marks that connect ring positions to grid lines
function VerticalTicks({ count }) {
  const geometry = useMemo(() => {
    const pts = []
    const spread = 28
    for (let i = 0; i < count; i++) {
      const x = -spread + (i / (count - 1)) * spread * 2
      pts.push(new THREE.Vector3(x, -1.65, 0))
      pts.push(new THREE.Vector3(x,  1.65, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [count])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#f97316" transparent opacity={0.04} />
    </lineSegments>
  )
}

// Small particles sprinkled along the horizontal band
function Particles() {
  const ref = useRef()

  const { positions, colors } = useMemo(() => {
    const count = 260
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const cyan   = new THREE.Color('#22d3ee')
    const orange = new THREE.Color('#f97316')
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 56   // wide x spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5    // narrow y band
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2
      const c = Math.random() < 0.5 ? cyan : orange
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.008
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

const RING_COUNT = 18

export default function WorkBackground() {
  // Spread rings evenly across the section width
  const ringZPositions = useMemo(() =>
    Array.from({ length: RING_COUNT }, (_, i) => -26 + (i / (RING_COUNT - 1)) * 52),
  [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      dpr={[1, 1.5]}
    >
      <GridLines />
      <VerticalTicks count={RING_COUNT} />
      <Particles />
      {ringZPositions.map((z, i) => (
        <Ring key={i} z={z} index={i} total={RING_COUNT} />
      ))}
    </Canvas>
  )
}
