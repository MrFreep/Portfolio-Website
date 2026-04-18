// src/components/UI/GlobalBackground.js
//
// ONE fixed canvas. The camera travels DOWN the Y axis as the user scrolls,
// passing each section's 3D object in turn. Objects come into frame, fill
// the viewport, then float off above — exactly like scrolling through a
// physical 3D space.
'use client'
import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const lerp = (a, b, t) => a + (b - a) * t

// Total world-units the camera travels (hero y=0 → contact y=TRAVEL)
const TRAVEL = -36

// ── Camera rig — smooth scroll-driven vertical travel ─────────────────────
function CameraRig({ scrollRef }) {
  const { camera } = useThree()
  const y = useRef(0)

  useFrame(() => {
    const target = scrollRef.current * TRAVEL
    y.current = lerp(y.current, target, 0.055)
    camera.position.y = y.current
  })

  return null
}

// ── About: large wireframe icosahedron, right side ─────────────────────────
function AboutObject() {
  const mesh = useRef()

  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.elapsedTime * 0.17
    mesh.current.rotation.y = clock.elapsedTime * 0.26
  })

  return (
    <mesh ref={mesh} position={[3.8, TRAVEL * 0.22, -2]}>
      <icosahedronGeometry args={[3.0, 1]} />
      <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.28} />
    </mesh>
  )
}

// ── Skills: constellation of lines, left side ─────────────────────────────
function SkillsObject() {
  const group = useRef()

  const lineGeo = useMemo(() => {
    // Deterministic node layout — no Math.random so it's stable across renders
    const nodes = [
      [ 0.0,  0.0, 0], [ 2.2,  1.0, 0], [-2.0,  1.4, 0], [ 0.8,  2.6, 0],
      [-0.9, -1.6, 0], [ 2.8, -0.4, 0], [-2.7, -0.9, 0], [ 0.1,  3.2, 0],
      [ 3.1,  2.1, 0], [-3.0,  2.0, 0], [ 1.6, -2.2, 0], [-1.4, -2.6, 0],
      [ 2.6,  2.7, 0], [-2.1, -0.4, 0], [ 0.4, -3.1, 0],
    ]
    const edges = [
      [0,1],[0,2],[0,3],[1,3],[2,3],[1,8],[3,7],[2,9],
      [0,4],[0,5],[0,6],[4,11],[5,10],[6,12],[7,8],[9,12],
      [4,13],[5,1],[10,14],[11,6],[3,8],[2,6],
    ]
    const pts = []
    edges.forEach(([a, b]) => {
      pts.push(new THREE.Vector3(...nodes[a]))
      pts.push(new THREE.Vector3(...nodes[b]))
    })
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.rotation.z = Math.sin(t * 0.14) * 0.18
    group.current.rotation.y = t * 0.07
  })

  return (
    <group ref={group} position={[-4.0, TRAVEL * 0.44, 0]}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.38} />
      </lineSegments>
    </group>
  )
}

// ── Work: torus knot, right side ──────────────────────────────────────────
function WorkObject() {
  const mesh = useRef()

  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.elapsedTime * 0.14
    mesh.current.rotation.y = clock.elapsedTime * 0.21
    mesh.current.rotation.z = clock.elapsedTime * 0.07
  })

  return (
    <mesh ref={mesh} position={[3.2, TRAVEL * 0.66, -3]}>
      <torusKnotGeometry args={[2.2, 0.55, 140, 16, 2, 3]} />
      <meshBasicMaterial color="#f97316" wireframe transparent opacity={0.22} />
    </mesh>
  )
}

// ── Contact: three nested orbiting rings, centred ─────────────────────────
function ContactObject() {
  const r1 = useRef(), r2 = useRef(), r3 = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (r1.current) { r1.current.rotation.x = t * 0.22; r1.current.rotation.y = t * 0.16 }
    if (r2.current) { r2.current.rotation.y = t * 0.30; r2.current.rotation.z = t * 0.13 }
    if (r3.current) { r3.current.rotation.z = t * 0.26; r3.current.rotation.x = t * 0.19 }
  })

  return (
    <group position={[0, TRAVEL * 0.90, 0]}>
      <mesh ref={r1}>
        <torusGeometry args={[3.0, 0.035, 8, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.42} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[2.0, 0.030, 8, 100]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.32} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[1.1, 0.025, 8, 80]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.38} />
      </mesh>
    </group>
  )
}

// ── Canvas ─────────────────────────────────────────────────────────────────
export default function GlobalBackground() {
  const scrollRef = useRef(0)

  useEffect(() => {
    function onScroll() {
      const maxH = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = maxH > 0 ? window.scrollY / maxH : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 62 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      dpr={[1, 1.5]}
    >
      <CameraRig scrollRef={scrollRef} />
      <AboutObject />
      <SkillsObject />
      <WorkObject />
      <ContactObject />
    </Canvas>
  )
}
