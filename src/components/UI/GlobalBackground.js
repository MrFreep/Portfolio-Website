// src/components/UI/GlobalBackground.js
// ONE fixed canvas behind the entire page.
// A liquid wave surface fills the viewport; scroll drives smooth color + motion
// transitions through Hero → About → Skills → Work → Contact.
'use client'
import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Resolution ─────────────────────────────────────────────────────────────
const SW = 60   // width segments
const SH = 44   // height segments
const PW = 9    // plane width  (world units)
const PH = 6    // plane height

// ── Per-section visual configs (Hero → About → Skills → Work → Contact) ───
const SECTION_CONFIGS = [
  // Hero — electric cyan, energetic
  { bright: [0.133, 0.827, 0.933], dark: [0.008, 0.059, 0.078], speed: 1.05, amp: 1.1, fx: 0.40, fy: 0.30 },
  // About — warm amber, slower and cosy
  { bright: [0.976, 0.451, 0.086], dark: [0.078, 0.031, 0.000], speed: 0.62, amp: 0.72, fx: 0.33, fy: 0.38 },
  // Skills — cool electric blue, structured
  { bright: [0.220, 0.749, 0.996], dark: [0.016, 0.047, 0.094], speed: 1.10, amp: 0.88, fx: 0.48, fy: 0.28 },
  // Work — orange / warm, dynamic
  { bright: [0.980, 0.471, 0.090], dark: [0.082, 0.027, 0.000], speed: 0.88, amp: 1.12, fx: 0.38, fy: 0.42 },
  // Contact — deep cyan, calm and settled
  { bright: [0.133, 0.827, 0.933], dark: [0.008, 0.047, 0.063], speed: 0.44, amp: 0.52, fx: 0.28, fy: 0.24 },
]

function lerp(a, b, t) { return a + (b - a) * t }

// Returns a config interpolated to the page scroll progress (0 → 1)
function sampleConfig(scroll) {
  const max = SECTION_CONFIGS.length - 1
  const pos = scroll * max
  const i   = Math.min(Math.floor(pos), max - 1)
  const t   = pos - i
  const A   = SECTION_CONFIGS[i]
  const B   = SECTION_CONFIGS[i + 1]
  return {
    br: lerp(A.bright[0], B.bright[0], t),
    bg: lerp(A.bright[1], B.bright[1], t),
    bb: lerp(A.bright[2], B.bright[2], t),
    dr: lerp(A.dark[0],   B.dark[0],   t),
    dg: lerp(A.dark[1],   B.dark[1],   t),
    db: lerp(A.dark[2],   B.dark[2],   t),
    speed: lerp(A.speed, B.speed, t),
    amp:   lerp(A.amp,   B.amp,   t),
    fx:    lerp(A.fx,    B.fx,    t),
    fy:    lerp(A.fy,    B.fy,    t),
  }
}

// ── The wave mesh ──────────────────────────────────────────────────────────
function LiquidField({ scrollRef }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PW, PH, SW, SH)
    g.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array((SW + 1) * (SH + 1) * 3), 3)
    )
    return g
  }, [])

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [])

  // Smoothed live config — lerps toward target each frame for liquid feel
  const live = useRef(sampleConfig(0))

  useFrame(({ clock }) => {
    const target = sampleConfig(scrollRef.current)
    const c  = live.current
    const lf = 0.022  // lerp factor — slow enough to feel like fluid, fast enough to follow scroll

    c.br    = lerp(c.br,    target.br,    lf)
    c.bg    = lerp(c.bg,    target.bg,    lf)
    c.bb    = lerp(c.bb,    target.bb,    lf)
    c.dr    = lerp(c.dr,    target.dr,    lf)
    c.dg    = lerp(c.dg,    target.dg,    lf)
    c.db    = lerp(c.db,    target.db,    lf)
    c.speed = lerp(c.speed, target.speed, lf)
    c.amp   = lerp(c.amp,   target.amp,   lf)
    c.fx    = lerp(c.fx,    target.fx,    lf)
    c.fy    = lerp(c.fy,    target.fy,    lf)

    const t   = clock.elapsedTime * c.speed
    const pos = geo.attributes.position
    const col = geo.attributes.color

    for (let i = 0; i < pos.count; i++) {
      const ci  = i % (SW + 1)
      const ri  = Math.floor(i / (SW + 1))
      const x   = -PW / 2 + ci * (PW / SW)
      const y   = -PH / 2 + ri * (PH / SH)

      // Organic multi-frequency wave — four overlapping sinusoids
      const z =
        Math.sin(x * c.fx * 1.0 + t * 0.72)                        * c.amp * 0.80 +
        Math.sin(y * c.fy * 0.9 - t * 0.48 + 1.3)                  * c.amp * 0.55 +
        Math.cos((x + y) * c.fx * 0.6 + t * 0.55)                  * c.amp * 0.42 +
        Math.sin(x * c.fx * 0.28 - y * c.fy * 0.22 + t * 0.38)     * c.amp * 0.28

      pos.setZ(i, z)

      // Map height to colour: trough = dark, peak = bright
      const range = c.amp * 4.0
      const n = Math.max(0, Math.min(1, (z + range * 0.5) / range))
      col.setXYZ(i,
        c.dr + (c.br - c.dr) * n,
        c.dg + (c.bg - c.dg) * n,
        c.db + (c.bb - c.db) * n,
      )
    }

    pos.needsUpdate = true
    col.needsUpdate = true
  })

  return (
    <mesh
      geometry={geo}
      material={mat}
      rotation={[-Math.PI * 0.30, 0, 0]}
      position={[0, -0.4, 0]}
    />
  )
}

// ── Canvas wrapper ─────────────────────────────────────────────────────────
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
      camera={{ position: [0, 1.8, 6], fov: 68 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      dpr={[1, 1.5]}
    >
      <LiquidField scrollRef={scrollRef} />
    </Canvas>
  )
}
