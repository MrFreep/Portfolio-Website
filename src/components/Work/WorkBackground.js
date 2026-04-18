// src/components/Work/WorkBackground.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The canvas is position:absolute inset:0, so it's as tall as the Work section
// (often 2000–3000px).  R3F maps the camera frustum to the full canvas, so
// objects must be spread along the Y axis to appear throughout the section.
//
// Camera z=9, fov 65 → at z=0 the visible half-height ≈ 4.8 world-units.
// We spread rings from y = -Y_HALF to +Y_HALF so they fill the full canvas.

const Y_HALF  = 14   // covers even very long sections
const RINGS   = 22   // number of rings spread top-to-bottom

// ── Single glowing ring ────────────────────────────────────────────────────
function Ring({ y, index }) {
  const ref = useRef()

  // Alternating colours, evenly distributed
  const color  = index % 2 === 0 ? '#22d3ee' : '#f97316'
  // Slight horizontal stagger so they don't all sit on x=0
  const xShift = Math.sin(index * 1.3) * 0.9
  // Slight initial tilt per ring
  const tiltX0 = Math.cos(index * 0.9) * 0.18
  const tiltZ0 = Math.sin(index * 0.7) * 0.12

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.x = tiltX0 + Math.sin(t * 0.22 + index * 0.55) * 0.07
    ref.current.rotation.z = tiltZ0 + Math.cos(t * 0.18 + index * 0.40) * 0.06
  })

  return (
    <mesh ref={ref} position={[xShift, y, 0]}>
      {/* radius 2.1, tube 0.022 — fits well within camera FOV width */}
      <torusGeometry args={[2.1, 0.022, 10, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.20} />
    </mesh>
  )
}

// ── Vertical spine that runs the full height ──────────────────────────────
function Spine() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setFromPoints([
      new THREE.Vector3(0, -(Y_HALF + 2), 0),
      new THREE.Vector3(0,  (Y_HALF + 2), 0),
    ])
    return g
  }, [])

  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.12} />
    </line>
  )
}

// ── Horizontal connector marks at each ring position ─────────────────────
function ConnectorMarks({ yValues }) {
  const geo = useMemo(() => {
    const pts = []
    yValues.forEach(y => {
      pts.push(new THREE.Vector3(-3.5, y, 0))
      pts.push(new THREE.Vector3( 3.5, y, 0))
    })
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [yValues])

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#f97316" transparent opacity={0.055} />
    </lineSegments>
  )
}

// ── Main export ────────────────────────────────────────────────────────────
export default function WorkBackground() {
  const yValues = useMemo(
    () => Array.from({ length: RINGS }, (_, i) =>
      -Y_HALF + (i / (RINGS - 1)) * (Y_HALF * 2)
    ),
    []
  )

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 65 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      dpr={[1, 1.5]}
    >
      <Spine />
      <ConnectorMarks yValues={yValues} />
      {yValues.map((y, i) => (
        <Ring key={i} y={y} index={i} />
      ))}
    </Canvas>
  )
}
