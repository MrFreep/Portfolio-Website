// src/components/Work/WorkBackground.js
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WIDTH_SEGS  = 24   // lines running top-to-bottom (depth lines)
const HEIGHT_SEGS = 100  // rows for smooth undulation
const PLANE_W     = 32
const PLANE_H     = 50   // tall enough to cover all 3 projects

function WaveGrid({ darkHex, brightHex, opacity, yBase, phaseOffset, speedMult, zRot, slant }) {
  const darkColor   = useMemo(() => new THREE.Color(darkHex),   [darkHex])
  const brightColor = useMemo(() => new THREE.Color(brightHex), [brightHex])

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(PLANE_W, PLANE_H, WIDTH_SEGS, HEIGHT_SEGS)
    const count = (WIDTH_SEGS + 1) * (HEIGHT_SEGS + 1)
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return g
  }, [])

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [opacity])

  useFrame(({ clock }) => {
    const pos    = geometry.attributes.position
    const colors = geometry.attributes.color
    const t = clock.elapsedTime * speedMult

    for (let i = 0; i < pos.count; i++) {
      const col   = i % (WIDTH_SEGS + 1)
      const row   = Math.floor(i / (WIDTH_SEGS + 1))
      const x     = -PLANE_W / 2 + col * (PLANE_W / WIDTH_SEGS)
      const origY = -PLANE_H / 2 + row * (PLANE_H / HEIGHT_SEGS)

      const y =
        Math.sin(x * 0.42 + t * 0.68 + phaseOffset)                         * 1.0  +
        Math.sin(x * 0.27 - origY * 0.30 + t * 0.50 + phaseOffset * 0.7)    * 0.65 +
        Math.cos(origY * 0.38 + t * 0.56 + phaseOffset * 1.3)                * 0.55 +
        x * slant

      pos.setY(i, y)

      // Shade: dark in troughs, bright at peaks
      const n = Math.max(0, Math.min(1, (y + 2.5) / 5.0))
      colors.setXYZ(
        i,
        darkColor.r + (brightColor.r - darkColor.r) * n,
        darkColor.g + (brightColor.g - darkColor.g) * n,
        darkColor.b + (brightColor.b - darkColor.b) * n,
      )
    }

    pos.needsUpdate    = true
    colors.needsUpdate = true
  })

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation={[-Math.PI * 0.36, 0, zRot]}
      position={[0, yBase, -1]}
    />
  )
}

export default function WorkBackground() {
  return (
    <Canvas
      camera={{ position: [0, 4, 11], fov: 72 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      dpr={[1, 1.5]}
    >
      {/* Cyan wave — foreground, diagonal tilt left-high right-low */}
      <WaveGrid
        darkHex="#041820"
        brightHex="#22d3ee"
        opacity={0.55}
        yBase={-1.0}
        phaseOffset={0}
        speedMult={1}
        zRot={0.28}
        slant={0.12}
      />
      {/* Orange wave — behind cyan, opposite diagonal */}
      <WaveGrid
        darkHex="#1a0800"
        brightHex="#f97316"
        opacity={0.40}
        yBase={-3.0}
        phaseOffset={2.1}
        speedMult={0.72}
        zRot={-0.20}
        slant={-0.08}
      />
    </Canvas>
  )
}
